import Portal from "./portal";import {createClient} from "../../lib/supabase/server";import {redirect} from "next/navigation";
export const dynamic="force-dynamic";export default async function Page(){const {data:{user}}=await (await createClient()).auth.getUser();if(!user||!user.email_confirmed_at)redirect("/portal/login");return <Portal/>;}
