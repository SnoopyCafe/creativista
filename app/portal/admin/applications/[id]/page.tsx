import {identity,owned} from "../../../../../lib/server";
import {redirect,notFound} from "next/navigation";
import Admin from "../../workspace";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){let user;try{user=await identity();}catch{redirect("/portal/login");}if(!user.staff)redirect("/portal");if(!user.roles.includes("Administrator")&&!user.roles.includes("Applications"))redirect("/portal/admin");const {id}=await params;try{await owned(id,user);}catch{notFound();}return <Admin applicationId={id}/>;}
