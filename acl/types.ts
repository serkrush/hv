import {IUser} from '@/server/models/User';

// export enum DROLE {
//   GUEST = "guest",
//   MACHINE = "machine",
//   USER = "user",
//   OWNER = "owner",
//   ROOT = "root",
// }

// export enum ACCESSROLE {
//   VIEWER = "viewer",
//   USER = "user",
//   ADMIN = "admin",
//   SUPERADMIN = "super-admin",
// }

export enum ROLE {
    GUEST = 'guest',
    MACHINE = 'machine',
    USER = 'user',
    OWNER = 'owner',
    ROOT = 'root',
}

export interface CategoryAthletes {
    [category: string]: {
        athletes: any[];
        description: string;
        color: number;
        name: string;
    };
}

export enum GRANT {
    //machine access
    VIEWER = 'viewer',
    USER = 'user',
    ADMIN = 'admin',
    OWNER = 'owner',

    // for business logic
    READ = 'read',
    WRITE = 'write',
    EXECUTE = 'execute',

    // for http requests
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export enum AuthType {
    Google = 'google',
    Facebook = 'facebook',
    Default = 'email/password',
}


export interface ISecretRole {
    role: ROLE;
    secret: string;
}

interface Identity {
    token?: string;
    userData: IUser;
}

export interface IIdentity {
    userId: any;
    firstName?: string;
    lastName?: string;
    role: ROLE;
    userEmail?: string;
    token?: string;
    secret?: string;
    locale: string;
    timezone: string;
    languageCode: string;
    countryCode: string;
    scale: string;
    authType: AuthType;
}

export interface IRoleData {
    display: string;
    url: string;
    parent?: ROLE[];
    private?: boolean;
}

export interface IRoles {
    [key: string]: IRoleData;
}

export interface IGrants {
    [key: string]: string[];
}

export interface IAllowDeny {
    allow: IGrants;
    deny?: IGrants;
}

export interface IRules {
    [key: string]: IAllowDeny;
}

export interface IIdentityACL {
    user: IIdentity;
    roles: IRoles;
    rules: IRules;
}

export interface IMenuData {
    icon?: any; //ReactIcon
    label: string;
    component?: any;
    url?: string;
    hide?: boolean;
    resources?: string[];
    items?: IMenu;
    grant?: GRANT;
    data?: any; // save any data within menu item
    route?: string;
    order?: number;
    handler?: any;
}

export interface IMenu {
    [key: string]: IMenuData;
}
