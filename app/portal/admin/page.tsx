import {resolveAdminSection} from '../../../lib/admin-navigation';
import {identity} from '../../../lib/server';
import {redirect} from 'next/navigation';
import Admin from './workspace';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{tab?:string;family?:string}>}){let user;try{user=await identity();}catch{redirect('/portal/login');}if(!user.staff)redirect('/portal');const params=await searchParams;const tab=resolveAdminSection(user.roles,params.tab);return <Admin initialTab={tab} initialFamily={params.family||""}/>;}
