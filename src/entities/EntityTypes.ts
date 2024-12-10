import {ROLE} from '@/acl/types';
import { IMachineAccess } from '@/server/models/MachineAccess';
import { IMachineGroup } from '@/server/models/MachineGroup';
import { ADD, DELETE, UPDATE } from '@/store/types/actionTypes';

export enum RecipeProcessType {
    Recipe = 'recipe',
    Preset = 'preset',
}

export interface ICategoryEntity {
    id: string | null;
    user_id?: string | null;
    category_name: string;
    recipe_process: RecipeProcessType;
    categories?: ICategoryEntity[];
    parent_id?: string;
    machine_id?: string | null;

    type?: string;
}

export enum RecipeStageType {
    Time = 'time',
    Weight = 'weight',
}
export enum IngridientActionType {
    Ingredient = 'ingredient',
    Method = 'method',
}

export type TRecipeEntities = {
    [key: string]: IRecipeEntity;
};

export interface PresetParams {
    adjustment: number;
    marinated: number;
    thickness: number;
}
export interface IRecipeEntity {
    id: string | null;
    description?: string;
    machine_type: MachineType;
    recipe_name: string;
    recipe_ingredients: IIngredientEntity[];
    recipe_process: string;
    type_session?: RecipeStageType;
    stages: IStageEntity[];
    categories: string[] | ISelectOptions[];
    base_thickness?: number;
    moisture?: number;
    media_resources?: string[];
    media_resources_buffer?: string[];

    type?: string;

    temperature?: PresetParams;
    time?: PresetParams;
}
export interface ISelectOptions {
    label: string;
    value: string;
}
export interface IIngredientEntity {
    action: IngridientActionType;
    description: string;
    index?: number;
    media_resource?: string;
    media_resource_buffer?: string;
}
export interface IStageEntity {
    fanPerformance1: number;
    fanPerformance2: number;
    duration?: number | null;
    heatingIntensity?: number | null;
    initTemperature: number;
    weight?: number | null;
}

// export type TCategoryEntities = ICategoryEntity[];
export type TCategoryEntities = {
    [key: string]: ICategoryEntity;
};

export interface IUserEntity {
    uid: string;
    parentsId?: string[];
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
}
export type TUserEntities = {
    [key: string]: IUserEntity;
};

export enum Zone {
    Top = 'Top',
    Middle = 'Middle',
    Bottom = 'Bottom',
    Left = 'Left',
    Right = 'Right',
}

export const zones = [
    Zone.Top,
    Zone.Middle,
    Zone.Bottom,
    Zone.Left,
    Zone.Right,
];

export enum MachineType {
    Dehydrator = 'dehydrator',
    FreezeDryer = 'freeze-dryer',
}

export const machineTypes = [MachineType.Dehydrator, MachineType.FreezeDryer];

export interface ScaledValue {
    m: string;
    i: string;
}

export interface IMachineEntity {
    id?: string
    meta?: {
        [key: string]: string;
    };
    model: string;
    zones: Zone[] | ISelectOptions[] | string[];
    brand: string;
    machineType?: MachineType;
    maxPowerUsage?: number; //kW
    avgPowerUsage?: number; //kW
    voltageFrequency?: {
        minVoltage: number; //V
        maxVoltage: number;
        minFrequncy: number; //Hz
        maxFrequncy: number;
    };
    maxAmperage?: number; //A
    safetyBreakerRequired?: string;
    powerCable?: string;
    temperatureMode?: string;
    temperatureRange?: {
        min: number; //C
        max: number;
    };
    timer?: {
        min: number;
        max: number; //h
    };
    independentZones?: number;
    totalTrayArea?: number; // m²
    totalTrays?: number;
    trayDimensions?: {
        h: number; //m
        w: number;
    };
    spaceBetweenTrays?: number; //m
    trayMeshSpacing?: {
        h: number; //m
        w: number;
    };
    machineWeight?: number; //kg
    productDimensions?: {
        w: number; //m
        h: number;
        d: number;
    };
    features?: string[];
    mediaResources?: string;
    mediaResourcesBuffer?: string;
    ownerId?: string;
}

export type TMachineEntities = {
    [key: string]: IMachineEntity
};
export type TAccessEntities = {
    [key: string]: IMachineAccess
};

export type TMachineGroupEntities = {
    [key: string]: IMachineGroup
};

export interface IInvitationEntity {
    id?: string;

    senderUserId: string;
    senderTimeZone: string;
    createdAt?: number;

    //existed
    receiverUserId?: string;
    receiver?: IUserEntity;

    //newUser
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
}

export type TInvitationEntities = {
    [key: string]: IInvitationEntity;
};

export const PUSH_ENTITY_ACTION = [ADD, UPDATE, DELETE] as const;
export interface PushCRUDData {
    entityName: string;
    actionType: (typeof PUSH_ENTITY_ACTION)[number];
    ids: string[];
}
