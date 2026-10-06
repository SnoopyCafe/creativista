import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Enroll your family | CreativistaPods",description:"Apply for a CreativistaPods learning pod, manage your family’s enrollment, and stay in touch with our team.",icons:{icon:"/brand/logo.jpg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <><link rel="stylesheet" href="/fonts/fonts.css"/><div className="portal-root">{children}</div></>;}
