export interface IZoneParams {
    // set of parameters for zone module
    initTemperature: number; // initial temperature that was set by user, celsius value
    heatingIntensity: number; // heating intensity, percentage value (%)
    fanPerformance1: number; // performance of fan #1, percentage value (%)
    fanPerformance2: number; // performance of fan #2, percentage value (%)

    // set of parameters for business logic
    duration: number; // cycle duration in minutes,
    weight: number; // a weight that should be achieved for dehydration cycle
}

export enum CycleStatus {
    Scheduled = 'scheduled',
    Started = 'started',
    Completed = 'completed',
}

export interface ICycleModel {
    machineId: string; //
    status: CycleStatus;

    zoneNumber: number;
    params: IZoneParams[];

    recipeId?: string;

    scheduledTime?: number;
}
