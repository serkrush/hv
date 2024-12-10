import { IMachineAccess } from "./MachineAccess";

export interface IInvitation {
    id?: string;
    senderUserId: string;
    senderTimeZone: string;
    accessData?: IMachineAccess[];

    //userExist
    receiverUserId?: string;

    //newUser
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;

   

    createdAt?: number;
}
