import {MessageCode} from '@/src/constants';

export default {
    translation: {
        [MessageCode.InvitationDeleted]: 'Запрошення успішно видалено',
        [MessageCode.InvitationAccepted]: 'Запрошення успішно прийнято',
        [MessageCode.MachineAccessDeleted]: 'Доступ до машини видалено успішно',
        [MessageCode.MachineAccessForUserDeleted]:
            'Доступи до машин для користувача успішно видалено',
        [MessageCode.MachineGroupDeleted]: 'Групу машин успішно видалено',
        [MessageCode.MachineModelDeleted]: 'Модель машини успішно видалено',
        [MessageCode.MachineDeleted]: 'Машину успішно видалено',
        [MessageCode.UserDeleted]: 'Користувача успішно видалено',
        [MessageCode.CycleDeleted]: 'Цикл видалено успішно',

        [MessageCode.IdentityUpdated]: 'Інформацію успішно оновлено',
        [MessageCode.UserLogin]: 'Користувач успішно ввійшов',
        [MessageCode.UserRegister]: 'Успішна реєстрація користувача',
        [MessageCode.InviteSent]: 'Запрошення надіслано успішно',
        [MessageCode.InviteAccepted]: 'Запрошення прийнято успішно',
        [MessageCode.InviteReceived]: 'Запрошення отримано успішно',

        [MessageCode.MachinesReceived]:
            'Інформація про машини успішно отримана',
        [MessageCode.MachineUpdated]: 'машина оновлена ​​успішно',
        [MessageCode.MachineInfoFetched]:
            'інформацію про машину отримано успішно',
        [MessageCode.MachineAdded]: 'машина додана успішно',
        [MessageCode.MachinePaired]: "машина з'єдналася успішно",
        [MessageCode.MachinePairConfirmed]: "машина з'єднана успішно",
        [MessageCode.FCMTokenUpdated]: 'Успішне оновлення FCM токена',

        [MessageCode.MachineGroupsReceived]: 'група машин отримана успішно',
        [MessageCode.MachineGroupUpdated]: 'група машин оновлена ​​успішно',
        [MessageCode.MachineGroupInfoFetched]:
            'інформація про групу машин успішно отримана',
        [MessageCode.MachineGroupAdded]: 'група машин успішно додана',
        [MessageCode.MachineGroupCreated]: 'група машин успішно створена',
        [MessageCode.MachineGroupMachinesReceived]:
            'група машин отримана успішно',

        [MessageCode.MachineAccessReceived]:
            'доступ до машини отримано успішно',
        [MessageCode.MachineAccessUpdated]: 'доступ до машини оновлено успішно',
        [MessageCode.MachineAccessInfoFetched]:
            'інформація про доступ до машини успішно отримана',
        [MessageCode.MachineAccessAdded]: 'доступ до машини додано успішно',
        
        [MessageCode.UserTransferRights]: 'ваші права було передано успішно',

        [MessageCode.MachineReceivedMessage]: 'повідомлення отримано успішно',

        [MessageCode.MachinesTracked]: 'машини відстежуються успішно',
        [MessageCode.MachinesUntracked]: 'відстеження машин завершене успішно',

        [MessageCode.CycleScheduled]: 'Цикл заплановано успішно',
        [MessageCode.CycleReceived]: 'цикл отримано успішно',
        [MessageCode.CycleUpdated]: 'цикл успішно видалено',

        [MessageCode.RequestSent]: 'запит надіслано',

        [MessageCode.FCMAdded]: 'FCM токен доданий',
        [MessageCode.FCMRemoved]: 'FCM токен видалений'
    },
};
