import {createClient} from "../../../../lib/supabase/server";
import {NextResponse} from "next/server";
export async function GET(request:Request){const url=new URL(request.url),code=url.searchParams.get("code");if(code){const c=await createClient(),{error}=await c.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(url.searchParams.get("next")==="/portal/reset-password"?"/portal/reset-password":"/portal/auth/landing",url.origin));}return NextResponse.redirect(new URL("/portal/login",url.origin));}
