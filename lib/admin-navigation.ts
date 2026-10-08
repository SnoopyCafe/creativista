export const adminSections=['Dashboard','Invoices','Accounts','Students','Assignments','Applications','Staff Admin','Application settings'];
export function allowedAdminSections(roles:string[]){return adminSections.filter(section=>roles.includes('Administrator')||roles.includes(section==='Application settings'?'Applications':section));}
export function defaultAdminSection(roles:string[]){const allowed=allowedAdminSections(roles);const preferred=roles.includes('Administrator')?'Dashboard':'Assignments';return allowed.includes(preferred)?preferred:allowed[0]||'';}
export function resolveAdminSection(roles:string[],requested?:string){const allowed=allowedAdminSections(roles);return requested&&allowed.includes(requested)?requested:defaultAdminSection(roles);}
