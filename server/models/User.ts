import {AuthType, ROLE} from '@/acl/types';


export interface FCMTokenPair {
    token: string
    lastUpdateTime: number
}
export interface IUser {
    uid: string;
    parentsId?: string[];
    fcmTokens?: FCMTokenPair[];
    firstName: string;
    lastName: string;
    email: string;
    role?: ROLE;
    country?: string;
    language?: string;
    timezone?: string;
    scale?: string;
    createdAt?: number;
    updatedAt?: number;
    isInvitation?: boolean;
    authType?: AuthType;
    currencySymbol?:string;
}

export interface TUser {
    [key: string]: IUser
}