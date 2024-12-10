import {MessageCode} from '@/src/constants';

export default {
    translation: {
        [MessageCode.InvitationDeleted]: 'Invitation deleted success',
        [MessageCode.InvitationAccepted]: 'Invitation accepted success',
        [MessageCode.MachineAccessDeleted]: 'Machine access deleted success',
        [MessageCode.MachineAccessForUserDeleted]:
            'Machine Access for user deleted success',
        [MessageCode.MachineGroupDeleted]: 'Machine Group deleted success',
        [MessageCode.MachineModelDeleted]: 'Machine Model deleted success',
        [MessageCode.MachineDeleted]: 'Machine deleted success',
        [MessageCode.UserDeleted]: 'User deleted success',
        [MessageCode.CycleDeleted]: 'Cycle deleted success',

        [MessageCode.IdentityUpdated]: 'Identity updated successfully',
        [MessageCode.UserLogin]: 'User logined success',
        [MessageCode.UserRegister]: 'User register success',
        [MessageCode.InviteSent]: 'Invite sent success',
        [MessageCode.InviteAccepted]: 'Invite accepted success',
        [MessageCode.InviteReceived]: 'Invite received succes',

        [MessageCode.MachinesReceived]: 'machines receive success',
        [MessageCode.MachineUpdated]: 'machine updated success',
        [MessageCode.MachineInfoFetched]: 'machine info fetched success',
        [MessageCode.MachineAdded]: 'machine added success',
        [MessageCode.MachinePaired]: 'machine paired success',
        [MessageCode.MachinePairConfirmed]: 'machine paired success',
        [MessageCode.FCMTokenUpdated]: 'FCM Token updated success',

        [MessageCode.MachineGroupsReceived]: 'machine group receive success',
        [MessageCode.MachineGroupUpdated]: 'machine group updated success',
        [MessageCode.MachineGroupInfoFetched]:
            'machine group info fetched success',
        [MessageCode.MachineGroupAdded]: 'machine group added success',
        [MessageCode.MachineGroupCreated]: 'machine group created success',
        [MessageCode.MachineGroupMachinesReceived]:
            'machine group receive success',

        [MessageCode.MachineAccessReceived]: 'machine access receive success',
        [MessageCode.MachineAccessUpdated]: 'machine access updated success',
        [MessageCode.MachineAccessInfoFetched]:
            'machine access info fetched success',
        [MessageCode.MachineAccessAdded]: 'machine access added success',
        
        [MessageCode.UserTransferRights]: 'Your rights was successfully transferred',

        [MessageCode.MachineReceivedMessage]: 'message was received successfully',

        [MessageCode.MachinesTracked]: 'machines tracked success',
        [MessageCode.MachinesUntracked]: 'machines untracked success',

        [MessageCode.CycleScheduled]: 'cycle scheduled success',
        [MessageCode.CycleReceived]: 'cycle received success',
        [MessageCode.CycleUpdated]: 'cycle deleted success',

        [MessageCode.RequestSent]: 'request sent',

        [MessageCode.FCMAdded]: 'FCM token added',
        [MessageCode.FCMRemoved]: 'FCM token removed'
    },
};
