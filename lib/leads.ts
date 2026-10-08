import {ImapFlow} from 'imapflow';
import {simpleParser} from 'mailparser';
const mailbox='admin@creativistapods.com';
export type Lead={id:string;name:string;email:string;subject:string;received:string|null;preview:string};
export function potentialLead(subject:string,text:string){const content=subject+' '+text;return /\b(enrol(?:l)?(?:ment|ing)?|tutor(?:ing)?|learning pod|homeschool|home school|summer camp|after.?school|admission|availability|waitlist|register(?:ing|ation)?|tuition|pricing|interested|inquir(?:y|ies|ing))\b/i.test(content)&&!/\b(unsubscribe|newsletter|delivery failure|undeliverable|password reset|verification code)\b/i.test(subject);}
export async function scanUnreadLeads(){
 const user=(process.env.IMAP_USER||process.env.SMTP_USER||'').trim();const pass=process.env.IMAP_PASS||process.env.SMTP_PASS;
 if(user.toLowerCase()!==mailbox||!pass)throw new Error('Connect the admin@creativistapods.com inbox using IMAP_USER and IMAP_PASS.');
 const client=new ImapFlow({host:process.env.IMAP_HOST||'imap.hostinger.com',port:993,secure:true,auth:{user,pass},logger:false,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
 client.on('error',()=>{});
 try{await client.connect();const lock=await client.getMailboxLock('INBOX',{readOnly:true});try{
 const unread=await client.search({seen:false},{uid:true});const uids=unread||[];const selected=uids.slice(-200);const leads:Lead[]=[];
 if(selected.length){for await(const message of client.fetch(selected,{envelope:true,source:{maxLength:65536}},{uid:true})){
 const parsed=await simpleParser(message.source||Buffer.alloc(0),{skipHtmlToText:false,skipTextToHtml:true});const subject=message.envelope?.subject||'(No subject)';const text=(parsed.text||'').replace(/\s+/g,' ').trim();const sender=message.envelope?.from?.[0];
 if(sender?.address&&potentialLead(subject,text))leads.push({id:String(message.uid),name:sender.name||sender.address,email:sender.address,subject,received:message.envelope?.date?new Date(message.envelope.date).toISOString():null,preview:text.slice(0,300)});
 }}return {leads:leads.reverse(),unread:uids.length,scanned:selected.length,checkedAt:new Date().toISOString()};
 }finally{lock.release();}}finally{await client.logout().catch(()=>client.close());}
}
