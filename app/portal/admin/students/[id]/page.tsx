import {identity} from "../../../../../lib/server";
import {redirect,notFound} from "next/navigation";
import Admin from "../../workspace";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){
  let user;try{user=await identity();}catch{redirect("/portal/login");}
  if(!user.staff)redirect("/portal");
  if(!user.roles.includes("Administrator")&&!user.roles.includes("Students"))redirect("/portal/admin");
  const {id}=await params;
  const {data,error}=await user.client.from("students").select("id").eq("id",id).maybeSingle();
  if(error||!data)notFound();
  return <Admin studentId={id} initialTab="Students"/>;
}
