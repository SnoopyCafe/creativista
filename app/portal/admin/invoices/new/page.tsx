import {identity} from '../../../../../lib/server';
import {redirect} from 'next/navigation';
import Admin from '../../workspace';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{family?:string}>}){let user;try{user=await identity();}catch{redirect('/portal/login');}if(!user.staff)redirect('/portal');if(!user.roles.includes('Administrator')&&!user.roles.includes('Invoices'))redirect('/portal/admin');const params=await searchParams;return <Admin invoicePage initialFamily={params.family||''}/>;}
