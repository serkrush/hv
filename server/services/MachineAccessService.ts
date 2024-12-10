import BaseContext from 'server/di/BaseContext';
const uuid = require('uuid');

import {ErrorCode, MachineMessage, MessageCode} from '@/src/constants';
import {IMachineAccess, PermissionLevel} from '../models/MachineAccess';
import {IMachineGroup} from '../models/MachineGroup';
import groupBy from '../utils/groupBy';
import uniq from '../utils/uniq';
import {access} from 'fs';
import { IMachine } from '../models/Machine';
import { IIdentity } from '@/acl/types';

export default class MachineAccessService extends BaseContext {
    /**
     * getAllMachinesAccess
     */
    public getAllMachinesAccess() {
        const {MachinesAccess} = this.di;
        return MachinesAccess.all();
    }

    /**
     * findMachineAccessInfo
     */
    public async findMachineAccessInfo(id: string) {
        const {MachinesAccess} = this.di;
        const access = await MachinesAccess.get(MachinesAccess.id(id));
        if (access) {
            return {...access.data, id: access.ref.id};
        } else {
            throw new Error(ErrorCode.NoAccessForId);
        }
    }

    /**
     * addMachineAccess
     */
    public addMachineAccess(data: IMachineAccess) {
        const {MachinesAccess} = this.di;
        return MachinesAccess.add(data);
    }

    /**
     * addMachineAccessWithId
     */
    public addMachineAccessWithId(id: string, data: IMachineAccess) {
        const {MachinesAccess} = this.di;
        return MachinesAccess.set(MachinesAccess.id(id), data);
    }

    /**
     * updateMachineAccessData
     */
    public async updateMachineAccessData(id: string, data: IMachineAccess) {
        const old = await this.findMachineAccessInfo(id);
        if (old) {
            return this.addMachineAccessWithId(id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NoAccessForId);
        }
    }

    /**
     * deleteMachineAccess
     */
    public async deleteMachineAccess(id: string) {
        const {MachinesAccess} = this.di;
        await MachinesAccess.remove(MachinesAccess.id(id));
        return {id, message: MessageCode.MachineAccessDeleted};
    }

    /**
     * shareAccess
     */
    public async shareAccess(data: IMachineAccess) {
        if (!data.userId && !data.email) {
            throw new Error(ErrorCode.NotProvidedUser);
        }

        if (!data.machineGroupId && !data.machineId) {
            throw new Error(ErrorCode.NotProvidedRecource);
        }

        const {MachinesAccess, UserService} = this.di;

        let userId = data.userId;
        if (userId == undefined) {
            const user = await UserService.findUserWithEmail(data.email!?.trim());
            if (user) {
                userId = user.uid;
            } else {
                throw new Error(ErrorCode.NotFoundUserForEmail);
            }
        }

        let createData = {
            id: uuid.v4(),
            permissionLevel: data.permissionLevel,
            userId: userId,
        };

        if (data.machineGroupId) {
            createData['machineGroupId'] = data.machineGroupId;
        }

        if (data.machineId) {
            createData['machineId'] = data.machineId;
        }

        const access = await MachinesAccess.add(createData);
        return await this.findMachineAccessInfo(access.id);
    }

    /**
     * getAccess
     */
    public async getAccessForUser(userId: string) {
        const {MachinesAccess} = this.di;
        const access = await MachinesAccess.query($ =>
            $.field('userId').eq(userId),
        );
        return access.map(acc => {
            return {...acc.data, id: acc.ref.id};
        });
    }

    /**
     * getUserAccessForMachine
     */
    public async getUserAccessForMachine(userId: string, machineId: string) {
        const {MachinesAccess} = this.di;
        const access = await MachinesAccess.query($ => [
            $.field('userId').eq(userId),
            $.field('machineId').eq(machineId),
        ]);
        return access.map(acc => {
            return {...acc.data, id: acc.ref.id};
        });
    }

    /**
     * getAccessedMachines
     */
    public async getAccessedMachines(
        userId: string,
        expandMachines: boolean = true,
    ) {
        const list = await this.getAccessForUser(userId);
        const {Machines} = this.di;
        const ids = list
            .filter(item => {
                return item.machineId != undefined;
            })
            .map(item => {
                return item.machineId ?? '';
            });

        let resMachines = [];
        const idsCopy = [...ids];
        if (ids.length > 0) {
            while (ids.length) {
                const batch = ids.splice(0, 30);
                const machines = await Machines.query($ =>
                    $.field('id').in(batch),
                );
                resMachines.push(
                    ...machines.map(machine => {
                        return {...machine.data, id: machine.ref.id};
                    }),
                );
            }
        }

        if (expandMachines) {
            const {MachinesGroups} = this.di;
            const groupsAccess = list.filter(item => {
                return item.machineGroupId != undefined;
            });
            const groupsIds = groupsAccess.map(item => {
                return item.machineGroupId ?? '';
            });

            let resGroups = [];
            if (groupsIds.length > 0) {
                while (groupsIds.length) {
                    const batch = groupsIds.splice(0, 30);
                    const groups = await MachinesGroups.query($ =>
                        $.field('id').in(batch),
                    );
                    resGroups.push(
                        ...groups.map(group => {
                            return {...group.data, id: group.ref.id};
                        }),
                    );
                }
            }

            let groupMachineIds: string[] = [];
            for (let i = 0; i < resGroups.length; i++) {
                const element: IMachineGroup = resGroups[i];
                groupMachineIds.push(...(element.machineIds ?? []));
            }
            groupMachineIds = uniq(groupMachineIds);
            groupMachineIds = groupMachineIds.filter(value => {
                return !idsCopy.includes(value);
            });

            let groupMachines = [];
            if (groupMachineIds.length > 0) {
                while (groupMachineIds.length) {
                    const batch = groupMachineIds.splice(0, 30);
                    const machines = await Machines.query($ =>
                        $.field('id').in(batch),
                    );
                    groupMachines.push(
                        ...machines.map(machine => {
                            return {...machine.data, id: machine.ref.id};
                        }),
                    );
                }
            }

            resMachines = [...resMachines, ...groupMachines];
        }

        return resMachines;
    }

    /**
     * getAccessedGroups
     */
    public async getAccessedGroups(userId: string) {
        const list = await this.getAccessForUser(userId);
        const ids = list
            .filter(item => {
                return item.machineGroupId != undefined;
            })
            .map(item => {
                return item.machineGroupId ?? '';
            });

        if (ids.length > 0) {
            let resGroups = [];
            while (ids.length) {
                const batch = ids.splice(0, 30);
                const {MachinesGroups} = this.di;
                const groups = await MachinesGroups.query($ =>
                    $.field('id').in(batch),
                );
                resGroups.push(
                    ...groups.map(group => {
                        return {...group.data, id: group.ref.id};
                    }),
                );
            }
            return resGroups;
        } else {
            return [];
        }
    }

    public async getExpandedAccessForUser(userId: string, getResourceData: boolean) {
        const {Machines, MachinesGroups} = this.di;
        const accessList = await this.getAccessForUser(userId);

        const machinesAccess = accessList.filter(item => {
            return item.machineId != undefined;
        });

        const groupsAccess = accessList.filter(item => {
            return item.machineGroupId != undefined;
        });

        const machineIds = machinesAccess.map(item => {
            return item.machineId ?? '';
        });
        const machineIdsCopy = [...machineIds];

        let resMachines: IMachine[] = [];
        if (getResourceData && machineIds.length > 0) {
            while (machineIds.length) {
                const batch = machineIds.splice(0, 30);
                const machines = await Machines.query($ =>
                    $.field('id').in(batch),
                );
                resMachines.push(
                    ...machines.map(machine => {
                        return {...machine.data, id: machine.ref.id};
                    }),
                );
            }
        }

        const groupsIds = groupsAccess.map(item => {
            return item.machineGroupId ?? '';
        });

        let resGroups = [];
        if (groupsIds.length > 0) {
            while (groupsIds.length) {
                const batch = groupsIds.splice(0, 30);
                const groups = await MachinesGroups.query($ =>
                    $.field('id').in(batch),
                );
                resGroups.push(
                    ...groups.map(group => {
                        return {...group.data, id: group.ref.id};
                    }),
                );
            }
        }

        let groupMachineIds: string[] = [];
        for (let i = 0; i < resGroups.length; i++) {
            const element: IMachineGroup = resGroups[i];
            groupMachineIds.push(...(element.machineIds ?? []));
        }
        groupMachineIds = uniq(groupMachineIds);
        groupMachineIds = groupMachineIds.filter(value => {
            return !machineIdsCopy.includes(value);
        });

        let groupMachines: IMachine[] = [];
        if (getResourceData && groupMachineIds.length > 0) {
            while (groupMachineIds.length) {
                const batch = groupMachineIds.splice(0, 30);
                const machines = await Machines.query($ =>
                    $.field('id').in(batch),
                );
                groupMachines.push(
                    ...machines.map(machine => {
                        return {...machine.data, id: machine.ref.id};
                    }),
                );
            }
        }

        let machinesAccessByGroup: IMachineAccess[] = [];
        for (let i = 0; i < groupsAccess.length; i++) {
            const groupAccess = groupsAccess[i];
            const group: IMachineGroup = resGroups.find(
                value => value.id == groupAccess.machineGroupId,
            );
            for (let j = 0; j < group.machineIds?.length; j++) {
                const machine = group.machineIds[j];
                machinesAccessByGroup.push({
                    id: `group_${group.id}_${machine}`,
                    userId: userId,
                    permissionLevel: groupAccess.permissionLevel,
                    machineId: machine,
                });
            }
        }

        const mergedAccess = [...machinesAccess, ...machinesAccessByGroup];
        const grouped = groupBy(mergedAccess, 'machineId');
        const permissionOrder = Object.values(PermissionLevel);

        let computedAccess = Object.keys(grouped)
            .map(key => {
                const accessGroup: IMachineAccess[] = grouped[key];
                if (accessGroup && accessGroup.length > 0) {
                    accessGroup.sort(
                        (a, b) =>
                            permissionOrder.indexOf(a.permissionLevel) -
                            permissionOrder.indexOf(b.permissionLevel),
                    );
                    return accessGroup[accessGroup.length - 1];
                } else {
                    return undefined;
                }
            })
            .filter(value => value != undefined);

        return {
            machinesAccess,
            expandedMachinesAccess: computedAccess,

            groupsAccess,

            machines: getResourceData ? resMachines : undefined,
            expandedMachines: getResourceData
                ? [...resMachines, ...groupMachines]
                : undefined,

            groups: getResourceData ? resGroups : undefined,
        };
    }

    /**
     * getUserWithAccess
     */
    public async getUserWithAccess(userId: string) {
        const {UserService, MachineService, MachineGroupService} = this.di;
        const user = await UserService.findUserInfo(userId);
        const access = await this.getAccessForUser(userId);
        const ownGroups = await MachineGroupService.getMachineGroupsForUser(
            userId,
        );
        const accessedGroups = await this.getAccessedGroups(userId);
        const ownMachines = await MachineService.getMachinesForUser(userId);
        const accesedMachines = await this.getAccessedMachines(userId);

        return {
            ...user,
            groups: [...ownGroups, ...accessedGroups],
            machines: [...ownMachines, ...accesedMachines],
            access,
        };
    }

    /**
     * updateUserAccess
     */
    public async updateUserAccess(userId: string, access: IMachineAccess[], notify: boolean = false, identity: IIdentity = undefined) {
        const oldAccess = await this.getAccessForUser(userId);

        const addList = access.filter(acc => {
            return acc.id == '';
        });

        const deleteList = oldAccess.filter(acc => {
            return (
                access.findIndex(item => {
                    return item.id == acc.id;
                }) == -1
            );
        });

        const updateList = oldAccess
            .filter(acc => {
                return (
                    access.findIndex(item => {
                        return item.id == acc.id;
                    }) != -1
                );
            })
            .map(item => {
                return {
                    old: item,
                    new: access[
                        access.findIndex(x => {
                            return x.id == item.id;
                        })
                    ]!,
                };
            });

        for (let index = 0; index < deleteList.length; index++) {
            const element = deleteList[index];
            await this.deleteMachineAccess(element?.id);
        }

        for (let index = 0; index < updateList.length; index++) {
            const element = updateList[index];
            if (element) {
                await this.updateMachineAccessData(element.old.id, element.new);
            }
        }

        for (let index = 0; index < addList.length; index++) {
            const element = addList[index];
            if (element) {
                await this.shareAccess(element);
            }
        }
        
       
        if(notify && identity != undefined && identity?.userId != undefined && identity?.userId != userId) {
            const { UserService } = this.di
            const sender = await UserService.findUserInfo(identity.userId)
            await UserService.sendNotificationData([userId], {
                uuid: uuid.v4(),
                title: "access-update-title",
                message: "access-update-message",
                params: {
                    userName: sender.firstName + " " + sender.lastName
                },
                timestamp: Date.now(),
                actionType: 'ACCESS_UPDATE'
            })
        }

        return await this.getUserWithAccess(userId);
    }

    /**
     * deleteAccessForUser
     */
    public async deleteAccessForUser(userId: string) {
        const access = await this.getAccessForUser(userId);
        for (let index = 0; index < access.length; index++) {
            const element = access[index];
            await this.deleteMachineAccess(element?.id);
        }
        return {message: MessageCode.MachineAccessForUserDeleted};
    }

    /**
     * deleteUserAccessForMachine
     */
    public async deleteUserAccessForMachine(userId: string, machineId: string) {
        const access = await this.getUserAccessForMachine(userId, machineId);
        for (let index = 0; index < access.length; index++) {
            const element = access[index];
            await this.deleteMachineAccess(element?.id);
        }
        return {message: MessageCode.MachineAccessForUserDeleted};
    }

    /**
     * replaceUserAccess
     */
    public async replaceUserAccess(oldUserId: string, newUserId: string) {
        const access = await this.getAccessForUser(oldUserId);
        for (let index = 0; index < access.length; index++) {
            const element = access[index];
            if (element) {
                await this.updateMachineAccessData(element.id, {
                    ...element,
                    userId: newUserId,
                });
            }
        }

        return await this.getAccessForUser(newUserId);
    }

    /**
     * getMachineRelatedUsers
     */
    public async getMachineRelatedUsers(
        machineId: string,
        groupsIncludes: boolean,
    ) {
        const {MachinesAccess, MachinesGroups} = this.di;
        const machinesReceiversUserIDs: string[] = (
            await MachinesAccess.query($ => $.field('machineId').eq(machineId))
        ).map(access => {
            return access.data.userId;
        });

        let machinesReceiversUserIDsFromGroups: string[] = [];

        if (groupsIncludes) {
            const machinesReceiversGroupIDs = (
                await MachinesGroups.query($ =>
                    $.field('machineIds').contains(machineId),
                )
            ).map(access => {
                return access.data.id;
            });

            if (machinesReceiversGroupIDs.length > 0) {
                machinesReceiversUserIDsFromGroups = (
                    await MachinesAccess.query($ =>
                        $.field('machineGroupId').in(machinesReceiversGroupIDs),
                    )
                ).map(access => {
                    return access.data.userId;
                });
            }
        }

        return Array.from(
            new Set([
                ...machinesReceiversUserIDs,
                ...machinesReceiversUserIDsFromGroups,
            ]),
        );
    }

    /**
     * getMachineRelatedUsers
     */
    public async getMachineGroupRelatedUsers(
        machineGroupId: string,
    ) {
        const {MachinesAccess, MachinesGroups} = this.di;
        const machineGroupsReceiversUserIDs: string[] = (
            await MachinesAccess.query($ => $.field('machineGroupId').eq(machineGroupId))
        ).map(access => {
            return access.data.userId;
        });

        

        return Array.from(
            new Set([
                ...machineGroupsReceiversUserIDs,
            ]),
        );
    }

    /**
     * receivingMessage
     */
    public async receivingMessage(data: MachineMessage) {
        
        console.log("receivingMessage Data", data)
        const machine = await this.di.MachineService.findMachineByGuidIfExist(data.machineUid)
        if(machine == undefined) {
            console.log("machine for uid not found")
            return
        }
        const uniqueMachinesReceiversUserIDs = await this.getMachineRelatedUsers(machine.id, true)
        
        const { UserService } = this.di
        
        console.log(
            `\n\n\nReceivers of message "${data.message}"`,
            uniqueMachinesReceiversUserIDs,
            '\n\n\n',
        );

        await UserService.sendCustomData(uniqueMachinesReceiversUserIDs, "NOTIFICATION", data)  
    }

    /**
     * changeUserIDInAccessList
     */
    public async changeUserIDInAccessList(
        oldUserID: string,
        newUserID: string,
    ) {
        const {MachinesAccess} = this.di;
        const existedAccesses = await this.getAccessForUser(newUserID);
        const relatedAccesses = await this.getAccessForUser(oldUserID);
        const updatingPromisees = relatedAccesses.map(access => {
            // check if rights have already existed on this resource
            const existedAccess = existedAccesses.find(item => {
                if (item?.machineId && access?.machineId) {
                    return (
                        item?.machineId === access?.machineId &&
                        item.userId === newUserID
                    );
                } else if (item?.machineGroupId && access?.machineGroupId) {
                    return (
                        item?.machineGroupId === access?.machineGroupId &&
                        item.userId === newUserID
                    );
                }
                return false;
            });
            if (existedAccess) {
                MachinesAccess.remove(MachinesAccess.id(existedAccess.id));
            }
            return MachinesAccess.set(MachinesAccess.id(access.id), {
                ...access,
                userId: newUserID,
            });
        });
        return Promise.all(updatingPromisees);
    }

    public async getAccessesByMachineID(machineId: string) {
        const {MachinesAccess} = this.di;
        const access = await MachinesAccess.query($ => [
            $.field('machineId').eq(machineId),
        ]);
        return access.map(item => ({...item.data, id: item.ref.id}));
    }
}
