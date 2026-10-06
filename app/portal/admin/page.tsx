import {identity} from '../../../lib/server';
import {redirect} from 'next/navigation';
import Admin from './workspace';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{tab?:string;family?:string}>}){let user;try{user=await identity();}catch{redirect('/portal/login');}if(!user.staff)redirect('/portal');const params=await searchParams;const requested=["Applications","Invoices","Accounts","Staff Admin","Students","Assignments"].includes(params.tab||"")?params.tab:"Invoices";const allowed=["Invoices","Accounts","Students","Assignments","Applications","Staff Admin"].filter(t=>user.roles.includes("Administrator")||user.roles.includes(t));const tab=allowed.includes(requested||"")?requested:allowed[0];return <Admin initialTab={tab} initialFamily={params.family||""}/>;}
