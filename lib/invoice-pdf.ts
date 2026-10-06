import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
type Details={invoice_number?:string;issue_date?:string;service_date?:string;tutor?:string;students?:string;terms?:string;items?:{description:string;notes:string;quantity:number;unit_cents:number}[]};
type Invoice={details?:Details;id:string;description:string;cents:number;due:string;status:string;payment_method?:string;url?:string};
type Family={email:string;data:{parent?:string;email?:string;phone?:string;homeAddress?:string;program?:string;children?:{name:string}[]}};
export async function invoicePdf(invoice:Invoice,family:Family){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(.09,.13,.14),gray=rgb(.45,.5,.52),line=rgb(.8,.83,.84);let page=doc.addPage([612,792]),y=646;
 const clean=(s:string)=>s.replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\x7e\n]/g,'');
 const text=(s:string,x:number,yy:number,size=10,strong=false)=>page.drawText(clean(s),{x,y:yy,size,font:strong?bold:font,color:ink});
 const rule=(yy:number,x=50,width=512)=>page.drawLine({start:{x,y:yy},end:{x:x+width,y:yy},thickness:1,color:line});
 const wrap=(s:string,width:number,size=10,strong=false)=>{const f=strong?bold:font;const lines:string[]=[];for(const paragraph of clean(s).split('\n')){let current='';for(const word of paragraph.split(/\s+/)){for(const chunk of word.match(/.{1,45}/g)||['']){const next=current?current+' '+chunk:chunk;if(f.widthOfTextAtSize(next,size)>width&&current){lines.push(current);current=chunk;}else current=next;}}lines.push(current);}return lines;};
 const block=(s:string,x:number,yy:number,width:number,size=10,strong=false)=>{const lines=wrap(s,width,size,strong);for(const l of lines){text(l,x,yy,size,strong);yy-=size+4;}return yy;};
 const money=(n:number)=>'$'+(n/100).toFixed(2),date=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
 const generated=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/New_York'});
 const logo=await doc.embedJpg(await readFile(path.join(process.cwd(),'public/brand/logo.jpg')));const scale=logo.scaleToFit(118,66);page.drawImage(logo,{x:50,y:704,width:scale.width,height:scale.height});
 text('Creativista Charm LLC',184,754,11,true);text('info@creativistacharm.com | (954) 833-6672',184,738,9);
 text('Invoice #'+(invoice.details?.invoice_number||invoice.id.slice(0,8).toUpperCase()),440,754,10,true);text(invoice.details?.issue_date?'Issue date':'PDF date',484,728,9);block(invoice.details?.issue_date?date(invoice.details.issue_date):generated,440,714,122,9);
 page.drawRectangle({x:50,y:680,width:512,height:4,color:rgb(.92,.77,.47)});
 y=block(invoice.description,50,y,512,21,true)-8;
 y=block('STUDENT: '+(invoice.details?.students||(family.data.children||[]).map(c=>c.name).filter(Boolean).join(', ')),50,y,512)-2;
 if(invoice.details?.tutor)y=block('Tutor: '+invoice.details.tutor,50,y,512);
y=block('Company: Creativista Charm LLC',50,y,512)-12;
 y=block(invoice.details?.terms||'Parents/Guardians are invoiced monthly in advance for tutoring services. Please pay by the due date below. Contact our team with any questions about your invoice.',50,y,512)-20;
 const top=y;for(const x of [50,226,402])rule(top,x,160);
 text('Customer',50,top-22,10,true);text('Invoice Details',226,top-22,10,true);text('Payment',402,top-22,10,true);
 const customer=[family.data.parent||'',...(family.data.children||[]).map(c=>c.name),family.data.email||family.email,family.data.phone||'',family.data.homeAddress||''].filter(Boolean).join('\n');
 const end=block(customer,50,top-38,160);block('PDF created '+generated+'\n'+money(invoice.cents)+'\n'+(invoice.details?.service_date?'Service date '+date(invoice.details.service_date):family.data.program||''),226,top-38,160);block('Due '+date(invoice.due)+'\n'+money(invoice.cents)+'\n'+invoice.status,402,top-38,160);
 y=Math.min(end,top-104)-18;if(y<170){page=doc.addPage([612,792]);y=730;}
 const itemHeader=()=>{rule(y);text("Items",50,y-22,10,true);text("Quantity",354,y-22,10,true);text("Price",440,y-22,10,true);text("Amount",515,y-22,10,true);rule(y-34);y-=55;};itemHeader();
 const items=invoice.details?.items?.length?invoice.details.items:[{description:invoice.description,notes:"",quantity:1,unit_cents:invoice.cents}];
 for(const item of items){const content=item.description+(item.notes?"\n"+item.notes:"");const lines=wrap(content,285);if(y-lines.length*14<160){page=doc.addPage([612,792]);y=730;itemHeader();}const end=block(content,50,y,285);text(String(item.quantity),380,y);text(money(item.unit_cents),438,y);text(money(Math.round(item.quantity*item.unit_cents)),510,y);y=Math.min(end,y-14)-14;rule(y);y-=22;}
 if(y<160){page=doc.addPage([612,792]);y=730;}text("Subtotal",50,y);text(money(invoice.cents),510,y);rule(y-12);text(invoice.status==="Paid"?"Total Paid":"Total Due",50,y-38,16,true);text(money(invoice.cents),495,y-38,16,true);
 const stepUp=invoice.payment_method==='Step Up for Students';if(stepUp){text('Step Up link',50,98,11,true);block('https://apply.stepupforstudents.org/',50,80,490,9);}else{text('Zelle',50,98,11,true);block('Contact our team for actual payment instructions. The demonstration QR supplied by email is not valid for payments.',50,80,490,9);}
 doc.getPages().forEach((p,i)=>p.drawText('Page '+(i+1)+' of '+doc.getPageCount(),{x:490,y:38,size:9,font,color:gray}));return Buffer.from(await doc.save());
}
