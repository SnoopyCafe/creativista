export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return new Response(null,{status:403});
 const target=process.env.LEGACY_REFERRER_URL;if(!target)return new Response(null,{status:503});
 const url=new URL(target);if(url.protocol!=='https:'||url.origin===new URL(request.url).origin)return new Response(null,{status:503});
 const body=await request.text();if(body.length>4096)return new Response(null,{status:413});
 try{const result=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://creativistapods.com'},body,signal:AbortSignal.timeout(5000)});return new Response(null,{status:result.status});}catch{return new Response(null,{status:503});}
}
