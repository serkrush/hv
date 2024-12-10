import BaseContext from 'server/di/BaseContext';
import {IMachineModel} from '../models/MachineModel';
import {ErrorCode, MessageCode} from '@/src/constants';
import {CycleStatus, ICycleModel, IZoneParams} from '../models/ICycleModel';
import mapRecipeToCycleParams from '@/src/utils/mapRecipeToCycleParams';

export default class CycleService extends BaseContext {
    /**
     * getAllCycles
     */
    public async getAllCycles() {
        const {Cycles} = this.di;
        const cycles = await Cycles.all();
        const maped = cycles.map(cycle => {
            return {...cycle.data, id: cycle.ref.id};
        });
        return maped;
    }

    /**
     * getMachinesCycles
     */
    public async getMachinesCycles(machineId: string, status?: CycleStatus) {
        const {Cycles} = this.di;
        const cycles = await Cycles.query($ =>
            status
                ? [
                      $.field('machineId').eq(machineId),
                      $.field('status').eq(status),
                  ]
                : [$.field('machineId').eq(machineId)],
        );
        const maped = cycles.map(cycle => {
            return {...cycle.data, id: cycle.ref.id};
        });
        return maped;
    }

    /**
     * getMachinesCyclesByGuid
     */
    public async getMachinesCyclesByGuid(
        machineGuid: string,
        status?: CycleStatus,
    ) {
        const {Cycles, MachineService} = this.di;
        const machine = await MachineService.findMachineByGuidIfExist(
            machineGuid,
        );
        const machineId = machine.id;
        const cycles = await Cycles.query($ =>
            status
                ? [
                      $.field('machineId').eq(machineId),
                      $.field('status').eq(status),
                  ]
                : [$.field('machineId').eq(machineId)],
        );
        const maped = cycles.map(cycle => {
            return {...cycle.data, id: cycle.ref.id};
        });
        return maped;
    }

    /**
     * syncCycles
     */
    public async syncScheduledCycles(
        machineGuid: string,
        cycles: ICycleModel[],
    ) {
        for (let i = 0; i < cycles.length; i++) {
            const element = cycles[i];
            await this.scheduleCycle({
                machineId: element.machineId,
                zoneNumber: element.zoneNumber,
                params: element.params,
                recipeId: element.recipeId,
                scheduledTime: element.scheduledTime,
            });
        }

        return this.getMachinesCyclesByGuid(machineGuid, CycleStatus.Scheduled);
    }

    /**
     * findCycleInfo
     */
    public async findCycleInfo(id: string) {
        const {Cycles} = this.di;
        const cycle = await Cycles.get(Cycles.id(id));
        if (cycle) {
            return {...cycle.data, id: cycle.ref.id};
        } else {
            throw new Error(ErrorCode.NotFoundCycle);
        }
    }

    /**
     * addCycle
     */
    public async addCycle(data: ICycleModel) {
        const {Cycles} = this.di;

        const res = await Cycles.add(data);
        const cycle = await this.findCycleInfo(res.id);
        return cycle;
    }

    /**
     * addCycleWithId
     */
    public async addCycleWithId(id: string, data: ICycleModel) {
        const {Cycles} = this.di;

        const res = await Cycles.set(Cycles.id(id), data);
        const cycle = await this.findCycleInfo(res.id);
        return cycle;
    }

    /**
     * updateCycleData
     */
    public async updateCycleData(id: string, data: any) {
        const old = await this.findCycleInfo(id);
        if (old) {
            return this.addCycleWithId(id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NotFoundCycle);
        }
    }

    /**
     * deleteCycle
     */
    public async deleteCycle(id: string) {
        const {Cycles} = this.di;
        await Cycles.remove(Cycles.id(id));
        return {id, message: MessageCode.CycleDeleted};
    }

    /**
     * scheduleCycle
     */
    public async scheduleCycle({
        machineId,
        zoneNumber,
        params,
        recipeId,
        scheduledTime,
    }: {
        machineId: string;
        zoneNumber: number;
        params?: IZoneParams[];
        recipeId?: string;
        scheduledTime: number;
    }) {
        let actualParams = params;
        if (actualParams == undefined) {
            if (recipeId != undefined) {
                const {RecipeService} = this.di;
                const recipe = await RecipeService.findRecipeInfo(recipeId);
                params = mapRecipeToCycleParams(recipe);
            }
        }
        const cycle: ICycleModel = {
            recipeId,
            machineId,
            zoneNumber,
            params: actualParams,
            scheduledTime,
            status: CycleStatus.Scheduled,
        };

        return this.addCycle(cycle);
    }
}
