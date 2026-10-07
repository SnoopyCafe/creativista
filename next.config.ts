import type {NextConfig} from 'next';
const config:NextConfig={outputFileTracingIncludes:{'/':['./index.html'],'/shalimar':['./shalimar/index.html'],'/portal/api/invoices':['./public/brand/logo.jpg'],'/portal/api/portal':['./public/brand/logo.jpg']}};
export default config;
