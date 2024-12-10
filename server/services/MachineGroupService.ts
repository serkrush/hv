import BaseContext from 'server/di/BaseContext';
import {IMachineGroup} from '../models/MachineGroup';
import {PermissionLevel} from '../models/MachineAccess';
import {ErrorCode, MessageCode} from '@/src/constants';
import {IIdentity} from '@/acl/types';
import {PushCRUDData} from '@/src/entities/EntityTypes';
const uuid = require('uuid');
export default class MachineGroupService extends BaseContext {
    /**
     * getAllMachinesGroups
     */
    public getAllMachinesGroups() {
        const {MachinesGroups} = this.di;
        return MachinesGroups.all();
    }

    /**
     * findMachineGroupInfo
     */
    public async findMachineGroupInfo(id: string) {
        const {MachinesGroups} = this.di;
        const group = await MachinesGroups.get(MachinesGroups.id(id));
        const machines = await MachinesGroups(
            MachinesGroups.id(id),
        ).machines.all();
        if (group) {
            return {...group.data, id: group.ref.id};
        } else {
            throw new Error(ErrorCode.NotFoundMachineGroup);
        }
    }

    /**
     * findMachineGroupByCreator
     */
    public async findMachineGroupByCreator(creatorId: string) {
        const {MachinesGroups} = this.di;
        const groups = await MachinesGroups.query($ => [
            $.field('creatorId').eq(creatorId),
            $.field('createdAt').order('asc'),
        ]);
        if (groups) {
            return groups.map(group => {
                return {...group.data, id: group.ref.id};
            });
        } else {
            return null;
        }
    }

    /**
     * addMachineGroup
     */
    public async addMachineGroup(data: IMachineGroup) {
        const {MachinesGroups} = this.di;

        data.machineIds = data.machineIds ?? [];
        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();
        data.name = data.name?.trim(); 

        const group = await MachinesGroups.add(data);
        await this.updateMachineGroupData(group.id, {...data, id: group.id});
        await this.setNewMachinesIds(group.id, data.machineIds);
        return await this.findMachineGroupInfo(group.id);
    }

    /**
     * addMachineGroupWithId
     */
    public async addMachineGroupWithId(id: string, data: IMachineGroup) {
        const {MachinesGroups} = this.di;

        data.machineIds = data.machineIds ?? [];
        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();
        data.name = data.name?.trim(); 

        await MachinesGroups.set(MachinesGroups.id(id), {...data, id});
        await this.setNewMachinesIds(id, data.machineIds);
        return this.findMachineGroupInfo(id);
    }

    /**
     * addMachinesToGroup
     */
    public async addMachinesToGroup(groupId: string, data: string[]) {
        const {MachinesGroups} = this.di;
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            if (id) {
                await MachinesGroups(MachinesGroups.id(groupId)).machines.set(
                    MachinesGroups.sub.machines.id(id),
                    {id},
                );
            }
        }
        await this.updateMachinesIds(groupId);
    }

    /**
     * updateMachinesIds
     */
    public async updateMachinesIds(groupId: string) {
        const {MachinesGroups} = this.di;
        const ids = (
            await MachinesGroups(MachinesGroups.id(groupId)).machines.all()
        ).map(data => {
            return data.ref.id;
        });
        await MachinesGroups.update(MachinesGroups.id(groupId), {
            machineIds: ids,
        });
    }

    /**
     * setNewMachinesIds
     */
    public async setNewMachinesIds(groupId: string, machineIds: string[]) {
        const {MachinesGroups} = this.di;
        const ids =
            (
                await MachinesGroups(MachinesGroups.id(groupId)).machines.all()
            ).map(data => {
                return data.ref.id;
            }) ?? [];
        let idForAdd = machineIds;
        for (let index = 0; index < ids.length; index++) {
            const id = ids[index];
            if (id) {
                if (idForAdd.includes(id)) {
                    const i = idForAdd.indexOf(id, 0);
                    if (i > -1) {
                        idForAdd.splice(i, 1);
                    }
                } else {
                    await MachinesGroups(
                        MachinesGroups.id(groupId),
                    ).machines.remove(MachinesGroups.sub.machines.id(id));
                }
            }
        }

        for (let index = 0; index < idForAdd.length; index++) {
            const id = idForAdd[index];
            if (id) {
                await MachinesGroups(MachinesGroups.id(groupId)).machines.set(
                    MachinesGroups.sub.machines.id(id),
                    {id},
                );
            }
        }

        return this.updateMachinesIds(groupId);
    }

    /**
     * createMachineGroup
     */
    public async createMachineGroup(data: IMachineGroup) {
        const {MachineAccessService} = this.di;
        const group = await this.addMachineGroup(data);
        const resData = await this.findMachineGroupInfo(group.id);

        const access = await MachineAccessService.shareAccess({
            permissionLevel: PermissionLevel.SuperAdmin,
            userId: data.creatorId,
            machineGroupId: group.id,
        });
        return {...resData, id: group.id, access};
    }

    /**
     * findByIds
     */
    public async findByIds(
        ids: string[],
        accessCheck: boolean = false,
        userId: string = '',
    ) {
        let res: IMachineGroup[] = [];
        if (accessCheck) {
            const {MachineAccessService} = this.di;
            const userMachines =
                await MachineAccessService.getExpandedAccessForUser(
                    userId,
                    true,
                );
            res = userMachines.groups.filter(value => {
                return ids.includes(value.id);
            });
        } else {
            let groupIds = [...ids];
            while (groupIds.length) {
                const batch = groupIds.splice(0, 30);
                const {MachinesGroups} = this.di;
                const machines = await MachinesGroups.query($ =>
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
     * updateMachineGroupData
     */
    public async updateMachineGroupData(
        id: string,
        data: IMachineGroup,
        notify: boolean = false,
        excludedFCM: string[] = []
    ) {
        const old = await this.findMachineGroupInfo(id);
        if (old) {
            const res = await this.addMachineGroupWithId(id, {
                ...old,
                ...data,
                updatedAt: new Date().getTime(),
            });

            if (notify) {
                const {UserService, MachineAccessService} = this.di;

                const userIds =
                    await MachineAccessService.getMachineGroupRelatedUsers(id);

                await UserService.sendNotificationData(userIds, {
                    uuid: uuid.v4(),
                    title: 'group-update-title',
                    message: 'group-update-message',
                    params: {
                        groupName: data?.name,
                    },
                    timestamp: Date.now(),
                }, excludedFCM);
            }

            return res;
        } else {
            throw new Error(ErrorCode.NotFoundMachineGroup);
        }
    }

    /**
     * deleteMachineGroup
     */
    public async deleteMachineGroup(id: string) {
        const {MachinesGroups, MachinesAccess, MachineAccessService} = this.di;

        const ids =
            (await MachinesGroups(MachinesGroups.id(id)).machines.all()).map(
                data => {
                    return data.ref.id;
                },
            ) ?? [];

        for (let index = 0; index < ids.length; index++) {
            const element = ids[index];
            await MachinesGroups(MachinesGroups.id(id)).machines.remove(
                element,
            );
        }

        await MachinesGroups.remove(MachinesGroups.id(id));

        const access = (
            await MachinesAccess.query($ => $.field('machineGroupId').eq(id))
        ).map(acc => acc.ref.id);
        for (let i = 0; i < access.length; i++) {
            const acId = access[i];
            await MachineAccessService.deleteMachineAccess(acId);
        }
        return {id, message: MessageCode.MachineGroupDeleted};
    }

    /**
     * getMachineGroupsForUser
     */
    public async getMachineGroupsForUser(userId: string) {
        const {MachinesGroups} = this.di;
        const groups = await MachinesGroups.query($ =>
            $.field('creatorId').eq(userId),
        );
        //console.log("groups", groups);
        return groups.map(group => {
            return {...group.data, id: group.ref.id};
        });
    }

    /**
     * getMachinesForGroup
     */
    public async getMachinesForGroup(groupId: string) {
        const {Machines} = this.di;
        const groupInfo = await this.findMachineGroupInfo(groupId);
        const ids = groupInfo.machineIds ?? [];
        if (ids.length > 0) {
            let resMachines = [];
            while (ids.length) {
                const batch = ids.splice(0, 30);
                const machines = await Machines.query($ =>
                    $.field('id').in(batch),
                );
                resMachines.push(
                    machines.map(machine => {
                        return {...machine.data, id: machine.ref.id};
                    }),
                );
            }
            return resMachines;
        } else {
            return [];
        }
    }

    /**
     * getMachinesForGroup
     */
    public async getGroupsByMachineID(machineID: string) {
        const {MachinesGroups} = this.di;
        const groups = await MachinesGroups.query($ =>
            $.field('machineIds').contains(machineID),
        );
        return groups.map(group => ({...group.data, id: group.ref.id}));
    }

    /**
     * deleteMachineFromGroups
     */
    public async deleteMachineFromGroups(machineId: string) {
        const {MachinesGroups} = this.di;
        const groups = await MachinesGroups.query($ =>
            $.field('machineIds').contains(machineId),
        );
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i].data;
            if (group.id && group.machineIds) {
                const newMachineIds = group.machineIds.filter(
                    value => value != machineId,
                );
                if (newMachineIds.length != group.machineIds.length) {
                    await this.setNewMachinesIds(group.id, newMachineIds);
                }
            }
        }
    }

    /**
     * changeUserIDInGroups
     */
    public async changeUserIDInGroups(oldUserID: string, newUserID: string) {
        const {MachinesGroups} = this.di;
        const relatedGroups = await this.findMachineGroupByCreator(oldUserID);
        const updatingPromisees = relatedGroups.map(group => {
            return MachinesGroups.set(MachinesGroups.id(group.id), {
                ...group,
                creatorId: newUserID,
            });
        });
        return Promise.all(updatingPromisees);
    }
}
