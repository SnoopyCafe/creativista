import {identity,permit,fail} from '../../../../lib/server';
import {scanUnreadLeads} from '../../../../lib/leads';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(){try{const user=await identity();permit(user,'Administrator');try{return Response.json(await scanUnreadLeads(),{headers:{'Cache-Control':'private, no-store'}});}catch{return Response.json({error:'Unable to scan the admin inbox. Check the Hostinger IMAP connection.'},{status:503});}}catch(e){return fail(e);}}
