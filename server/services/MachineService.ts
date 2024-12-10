import BaseContext from 'server/di/BaseContext';
import {FanSpeed, IMachine, MachineState} from '../models/Machine';
import {PermissionLevel} from '../models/MachineAccess';
import {
    DEFAULT_SORT_DIR,
    ErrorCode,
    MessageCode,
    PushCommandType,
    SHORT_GUID_LENGTH,
    STATUS_UPDATE_TIME,
} from '@/src/constants';
import {IPagerParams} from '@/src/pagination/IPagerParams';
import {TypesaurusCore, TypesaurusQuery} from 'typesaurus';
import Guard from '@/acl/Guard';
import {generateMachineToken} from '../utils/token';
import {IIdentity, IRoles, IRules} from '@/acl/types';
const uuid = require('uuid');
export default class MachineService extends BaseContext {
    /**
     * getAllMachines
     */
    public getAllMachines() {
        const {Machines} = this.di;
        return Machines.all();
    }

    /**
     * getMachinesForUser
     */
    public async getMachinesForUser(userId: string) {
        const {Machines} = this.di;
        const machines = await Machines.query($ =>
            $.field('ownerId').eq(userId),
        );
        return machines.map(machine => {
            return {...machine.data, id: machine.ref.id};
        });
    }

    /**
     * findByIds
     */
    public async findByIds(
        ids: string[],
        accessCheck: boolean = false,
        userId: string = '',
    ) {
        let res: IMachine[] = [];
        if (accessCheck) {
            const {MachineAccessService} = this.di;
            const userMachines =
                await MachineAccessService.getExpandedAccessForUser(
                    userId,
                    true,
                );
            res = userMachines.expandedMachines.filter(value => {
                return ids.includes(value.id);
            });
        } else {
            let deviceIds = [...ids];
            while (deviceIds.length) {
                const batch = deviceIds.splice(0, 30);
                const {Machines} = this.di;
                const machines = await Machines.query($ =>
                    $.field('id').in(batch),
                );
                const data = machines.map(value => {
                    return value.data;
                });
                res.push(...data);
            }
        }
        console.log('res', res);
        return res;
    }

    /**
     * findMachineInfo
     */
    public async findMachineInfo(id: string) {
        const {Machines} = this.di;
        const machine = await Machines.get(Machines.id(id));
        if (machine) {
            return {...machine.data, id: machine.ref.id};
        } else {
            throw new Error(ErrorCode.NotFoundMachine);
        }
    }

    /**
     * findMachineByGuid
     */
    public async findMachineInfoByGuid(guid: string) {
        const {Machines} = this.di;
        const machines = await Machines.query($ => $.field('guid').eq(guid));
        if (machines.length > 0) {
            return {...machines[0].data, id: machines[0].ref.id};
        } else {
            throw new Error(ErrorCode.NotFoundMachine);
        }
    }

    /**
     * machineExist
     */
    public async findMachineIfExist(id: string) {
        const {Machines} = this.di;
        const machine = await Machines.get(Machines.id(id));
        if (machine) {
            return {...machine.data, id: machine.ref.id};
        } else {
            return undefined;
        }
    }

    /**
     * machineExistByGuid
     */
    public async findMachineByGuidIfExist(guid: string) {
        const {Machines} = this.di;
        const machines = await Machines.query($ => $.field('guid').eq(guid));
        if (machines.length > 0) {
            return {...machines[0].data, id: machines[0].ref.id};
        } else {
            return undefined;
        }
    }

    /**
     * updateFCMToken
     */
    public async updateFCMToken(machineGuid: string, fcmToken: string) {
        console.time('TIMER:updateFCMToken');
        const machine = await this.findMachineInfoByGuid(machineGuid);
        console.timeEnd('TIMER:updateFCMToken');
        return await this.updateMachineData(machine.id, {
            ...machine,
            fcmToken,
        });
    }

    /**
     * addMachine
     */
    public async addMachine(data: IMachine) {
        const {Machines} = this.di;

        data.state = data.state ?? MachineState.New;
        data.machineName = data?.machineName?.trim();
        data.zonesStatus = data.zonesStatus ?? [];
        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();
        data.shortGuid = data?.guid?.slice(SHORT_GUID_LENGTH);
        const res = await Machines.add(data);
        await this.updateMachineData(res.id, {...data, id: res.id});
        const machine = await this.findMachineInfo(res.id);
        return machine;
    }

    /**
     * addMachineWithId
     */
    public async addMachineWithId(id: string, data: IMachine) {
        const {Machines} = this.di;

        data.state = data.state ?? MachineState.New;
        data.zonesStatus = data.zonesStatus ?? [];
        data.machineName = data?.machineName?.trim();
        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();
        data.shortGuid = data?.guid?.slice(SHORT_GUID_LENGTH);

        const res = await Machines.set(Machines.id(id), {...data, id});
        const machine = await this.findMachineInfo(res.id);
        return machine;
    }

    /**
     * updateMachineData
     */
    public async updateMachineData(id: string, data: IMachine) {
        const old = await this.findMachineInfo(id);
        if (old) {
            return this.addMachineWithId(id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NotFoundMachine);
        }
    }

    /**
     * updateMachineSettings
     */
    public async updateMachineSettings(
        id: string,
        settings: {fanSpeed: FanSpeed[]; heatingIntensity: number},
    ) {
        const old = await this.findMachineInfo(id);
        if (old) {
            return this.addMachineWithId(id, {...old, ...settings});
        } else {
            throw new Error(ErrorCode.NotFoundMachine);
        }
    }

    /**
     * deleteMachine
     */
    public async deleteMachine(id: string) {
        const {
            Machines,
            MachinesAccess,
            MachineAccessService,
            MachineGroupService,
        } = this.di;
        await Machines.remove(Machines.id(id));
        const access = (
            await MachinesAccess.query($ => $.field('machineId').eq(id))
        ).map(acc => acc.ref.id);
        for (let i = 0; i < access.length; i++) {
            const acId = access[i];
            await MachineAccessService.deleteMachineAccess(acId);
        }

        await MachineGroupService.deleteMachineFromGroups(id);

        return {id, message: MessageCode.MachineDeleted};
    }

    /**
     * pairDehydrator
     */
    public async pairDehydrator(pairData: IMachine, userId: string) {
        const data: IMachine = {
            ...pairData,
            ownerId: userId,
        };

        const machine = await this.addMachine(data);
        const resData = await this.findMachineInfo(machine.id);

        const {MachineAccessService} = this.di;
        const access = await MachineAccessService.shareAccess({
            permissionLevel: PermissionLevel.SuperAdmin,
            userId,
            machineId: machine.id,
        });

        return {machine: {...resData, id: machine.id}, access};
    }

    /**
     * subscribeOnDevicesUpdate
     */
    public async subscribeOnDevicesUpdate(
        clientId: string,
        deviceIds: string[],
    ) {
        const {
            firebase: {messaging},
            Machines,
        } = this.di;

        let tokens = [];
        while (deviceIds.length) {
            const batch = deviceIds.splice(0, 30);
            const {Machines} = this.di;
            const machines = await Machines.query($ =>
                $.field('guid').in(batch),
            );
            tokens.push(
                ...machines.map(machine => {
                    return machine.data.fcmToken;
                }),
            );
        }
        tokens = tokens.filter(value => {
            return value != undefined;
        });
        if (tokens.length > 0) {
            const message = {
                data: {
                    type: PushCommandType.SOCKET_START,
                },
                // notification: {
                //     body: "Test",
                //     title: "Test"
                // },
                tokens,
            };

            messaging.sendEachForMulticast(message);
        } else {
            console.log('empty tokens array');
        }

        return {message: MessageCode.MachinesTracked};
    }

    /**
     * resubscribeOnDevicesUpdate
     */
    public async resubscribeOnDevicesUpdate(
        clientId: string,
        deviceIds: string[],
    ) {
        const {
            firebase: {messaging},
            Machines,
        } = this.di;

        let tokens = [];
        while (deviceIds.length) {
            const batch = deviceIds.splice(0, 30);
            const {Machines} = this.di;
            const machines = await Machines.query($ =>
                $.field('guid').in(batch),
            );
            tokens.push(
                ...machines.map(machine => {
                    return machine.data.fcmToken;
                }),
            );
        }
        tokens = tokens.filter(value => {
            return value != undefined;
        });
        const message = {
            data: {
                type: PushCommandType.SOCKET_START,
            },
            tokens,
        };

        if (tokens.length > 0) messaging.sendEachForMulticast(message);

        return {message: MessageCode.MachinesTracked};
    }

    /**
     * getMachinesStatuses
     */
    public async getMachinesStatuses(clientId: string, deviceIds: string[]) {
        const {
            firebase: {messaging},
        } = this.di;

        let tokens = [];
        while (deviceIds.length) {
            const batch = deviceIds.splice(0, 30);
            const {Machines} = this.di;
            const machines = await Machines.query($ =>
                $.field('guid').in(batch),
            );
            tokens.push(
                ...machines.map(machine => {
                    return machine.data.fcmToken;
                }),
            );
        }
        tokens = tokens.filter(value => {
            return value != undefined;
        });
        const message = {
            data: {
                clientId,
                type: PushCommandType.CURRENT_STATE,
            },
            tokens,
        };
        console.log('message', message);
        if (tokens.length > 0) messaging.sendEachForMulticast(message);
        const timer = setTimeout(() => {
            clearTimeout(timer);
        }, STATUS_UPDATE_TIME);
        return {message: MessageCode.RequestSent};
    }

    /**
     * getMachineIdentity
     */
    public async getMachineIdentity(guid: string) {
        const machine = await this.findMachineInfoByGuid(guid);

        const {UserService} = this.di;
        const auth = await UserService.authByUserId(machine.ownerId);
        auth.identity.token = generateMachineToken({
            mid: machine.guid,
        });
        return auth;
    }

    /**
     * updateMachineOwner
     */
    public async updateMachineOwner(
        machine: IMachine,
        auth: {
            identity: IIdentity;
            roles: IRoles;
            rules: IRules;
        },
    ) {
        const {
            Machines,
            firebase: {messaging},
        } = this.di;
        const cleanedGuardIdentity = {...auth};
        cleanedGuardIdentity.identity.token = generateMachineToken({
            mid: machine.guid,
        });

        const message = {
            data: {
                type: PushCommandType.UPDATE_IDENTITY,
            },
            token: machine.fcmToken,
        };
        console.log('update message', message, machine.guid);
        await messaging.send(message);
        await Machines.set(Machines.id(machine.id), {
            ...machine,
            ownerId: auth.identity.userId,
        });
    }

    /**
     * changeUserMachinesOwnerOnNew
     */
    public async changeUserMachinesOwnerOnNew(
        oldUserID: string,
        newUserID: string,
    ) {
        const {UserService} = this.di;
        const relatedMachines = await this.getMachinesForUser(oldUserID);
        const newOwner = await UserService.findUserInfo(newUserID);
        const identity = {
            userId: newOwner.uid,
            firstName: newOwner.firstName,
            lastName: newOwner.lastName,
            role: newOwner.role,
            userEmail: newOwner.email,
            secret: newOwner.email.replaceAll('.', '@'),
            locale: newOwner.language,
            timezone: newOwner.country,
            languageCode: newOwner.language,
            countryCode: newOwner.country,
            scale: newOwner.scale,
            authType: newOwner.authType,
        };

        const {roles, rules, config} = this.di;
        const guard = new Guard(roles, rules);
        guard.build(identity);

        const {Identity} = this.di;
        const auth = await Identity.cleanGuardIdentityWithAccesses(
            guard,
            identity,
        );

        const updatingPromisees = relatedMachines.map(machine => {
            return this.updateMachineOwner(machine, {...auth});
        });
        console.log('updatingPromisees', updatingPromisees);
        return Promise.all(updatingPromisees);
    }

    public async page(pager: IPagerParams) {
        const {
            Machines,
            Users,
            UserService,
            firebase: {firestore},
        } = this.di;

        const {page, perPage, lastDocumentId} = pager;
        if(pager?.filter && pager.filter['ownerName']) {
            let ownerId = "";
            let ownerNameSplitted = (pager.filter['ownerName'].toString() as string).split(' ');
            delete pager.filter['ownerName'];
            if(ownerNameSplitted.length) {
                const users = await Users.query($ => [$.field('lastName').gte(ownerNameSplitted[0])]);
                if(users.length > 0 && users[0]) {
                    ownerId = users[0].data.uid;
                }
            }
            pager.filter['ownerId'] = ownerId;
        }

        const filter = (
            helper: TypesaurusQuery.Helpers<
                TypesaurusCore.CollectionDef<
                    'machines',
                    IMachine,
                    false,
                    false,
                    false
                >
            >,
        ) => {
            return Object.keys(pager.filter ?? {}).map(key => {
                if(key === 'guid') {
                    const guid = pager.filter![key]?.toLowerCase();
                    return helper
                        .field('shortGuid' as keyof IMachine)
                        .eq(guid);
                }else {
                    return helper
                        .field(key as keyof IMachine)
                        .eq(pager.filter![key]);
                }
            });
        };
        let count = await Machines.query($ => [...filter($)]).count();
        let sortField = 'machineName';
        if (pager.sort && pager.sort['field']) {
            sortField = pager.sort['field'];
        }

        let sortDirection = DEFAULT_SORT_DIR;
        if (pager.sort && pager.sort['dir']) {
            sortDirection = pager.sort['dir'];
        }

        let query = firestore
            .collection('machines')
            .orderBy(sortField, sortDirection as any);
        Object.keys(pager.filter ?? {}).forEach(key => {
            if(key === 'guid') {
                const guid = pager.filter![key]?.toLowerCase();
                query = query.where('shortGuid', '==', guid);
            }else {
                query = query.where(key, '==', pager.filter![key]);
            }
        });
        if (lastDocumentId) {
            const afterDocument = await firestore
                .collection('machines')
                .doc(lastDocumentId)
                .get();
            query = query.startAfter(afterDocument);
        }

        const items = await query.limit(perPage).get();
        let res = items.docs.map(item => {
            return item.data();
        });
        res = await Promise.all(res.map(async (item) => {
            const user = await UserService.findUserInfo(item?.ownerId)
            if(user) {
                item['ownerId'] = user;
            }
            return item;
        }))
        return {
            items: res,
            count,
        };
    }
}
