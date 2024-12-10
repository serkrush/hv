import { ICategoryModel } from "./ICategoryModel";
import { Zone } from "./MachineModel";

export enum MachineState {
    New = "new",
    Activated = "activated",
    NeedRepair = "need-repair",
    OnRepair = "on-repair",
    Deleted = "deleted",
}

export const machineStates = [
    MachineState.New,
    MachineState.Activated,
    MachineState.NeedRepair,
    MachineState.OnRepair,
    MachineState.Deleted,
];

export enum MachineType {
    Dehydrator = "dehydrator",
    FreezeDryer = "freeze-dryer",
}

export enum ZoneAvailableState {
    Available = "available",
    Online = "online",
    Scheduled = "scheduled",
    Offline = "offline",
}

export const zoneAvailabilityStates = [
    ZoneAvailableState.Available,
    ZoneAvailableState.Online,
    ZoneAvailableState.Scheduled,
    ZoneAvailableState.Offline,
];

export interface ZoneAvailability {
    zone: Zone;
    state: ZoneAvailableState;
}

export interface ZoneInfo {
    zone: Zone;
    zoneNumber: number;
}

export interface FanSpeed {
    id: string;
    value: number;
}

export interface IMachine {
    id?: string;
    guid: string;
    shortGuid: string;
    modelId: string;
    proofOfPurchaseDate?: number;
    proofOfPurchaseFile?: string;
    ownerId?: string;
    machineName: string;
    machineType: MachineType;
    costPerKwh: number;
    state?: MachineState;
    zonesStatus?: ZoneAvailability[];
    zones?: ZoneInfo[];
    fanSpeed?: FanSpeed[]
    weightScaleFeature: boolean;
    heatingIntensity: number;

    country: string;
    language: string;
    scale: string;
    timezone: string;
    currencySymbol?: string;

    fcmToken?: string;

    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number;

    categories: ICategoryModel[];
}
