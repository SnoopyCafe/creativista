import {identity} from '../../../../lib/server';
import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await identity();return NextResponse.redirect(new URL(user.staff?'/portal/admin':'/portal',request.url));}catch{return NextResponse.redirect(new URL('/portal/login',request.url));}}
