import Ajv, { KeywordDefinition} from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import {ResponseCode, cycleStatuses, roles} from '@/src/constants';
import {machineTypes, zones} from '../models/MachineModel';
import {machineStates, zoneAvailabilityStates} from '../models/Machine';
import {permissionLevels} from '../models/MachineAccess';

const ajv = new Ajv({allErrors: true});
addFormats(ajv);
ajvErrors(ajv);

const propertyValues: {[key: string]: string[]} = {
    machineType: machineTypes,
    zone: zones,
    machineState: machineStates,
    zoneAvailabilityState: zoneAvailabilityStates,
    permissionLevel: permissionLevels,
    role: roles,
    status: cycleStatuses,
};

// Define the custom keyword to validate properties
const validatePropertyKeyword: KeywordDefinition = {
    keyword: 'validateProperty',
    type: 'object',
    validate: function (schema: any, data: any) {
        //let errors: ErrorObject[] = [];
        for (const key in schema) {
            if (data.hasOwnProperty(key)) {
                const allowedValues = propertyValues[schema[key]];
                const propertyValue = data[key];
                if (!allowedValues?.includes(propertyValue)) {
                    throw new Error(
                        `The value of '${key}' must be one of the following: ${allowedValues?.join(
                            ', ',
                        )}.`,
                    );
                }
            }
        }

        return true;
    },
};
ajv.addKeyword(validatePropertyKeyword);

export default function validate(schema) {
    return (req, res, next) => {
        let param = null;
        if (Array.isArray(req.body)) {
            param = req.body.reduce((a, v) => {
                a.push({
                    ... (req.query ?? {}),
                    ... (req.params ?? {}),
                    ... (v ?? {}),
                })
                return a;
            }, []);
        } else {
            param = {
                ...(req.body ?? {}),
                ...(req.query ?? {}),
                ...(req.params ?? {}),
            }
        }
        // console.log('param', param, 'schema', schema)
        const valid = ajv.validate(schema, param);
        if (!valid) {
            if (typeof res.status != 'undefined') {
                res.status(400).json({
                    message: ajv.errorsText(),
                    code: ResponseCode.TOAST,
                });
            } else {
                return {
                    props: {
                        error: {
                            message: ajv.errorsText(),
                            code: 400,
                        },
                    },
                };
            }
        } else {
            if (typeof document == 'undefined') {
                return next();
            } else {
                next();
            }
        }
    };
}

export function validateSSR(schema) {
    return context => {
        const param = context.query;
        return ajv.validate(schema, param);
    };
}

export const validateProps = {
    queryId: {type: 'string'},
    id: {type: 'number', minimum: 0},
    email: {type: 'string', format: 'email'},
    password: {type: 'string', format: 'password', minLength: 8},

    machine: {
        type: 'object',
        properties: {
            id: {type: 'string'},
            guid: {type: 'string'},
            shortGuid: {type: 'string'},
            modelId: {type: 'string'},
            proofOfPurchaseDate: {type: 'number'},
            proofOfPurchaseFile: {type: 'string'},
            ownerId: {type: 'string'},
            machineName: {type: 'string'},
            costPerKwh: {type: 'number'},
            zonesStatus: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        zone: {type: 'string'},
                        state: {type: 'string'},
                    },
                    validateProperty: {
                        zone: 'zone',
                        state: 'zoneAvailabilityState',
                    },
                },
            },
            country: {type: 'string'},
            language: {type: 'string'},
            scale: {type: 'string'},
            timezone: {type: 'string'},
            currencySymbol: {type: 'string'},

            createdAt: {type: 'number'},
            updatedAt: {type: 'number'},
            deletedAt: {type: 'number'},

            machineType: {type: 'string'},
            state: {type: 'string'},
            categories: {type: 'array'},
            fcmToken: {type: 'string'},
            zones: {type: 'array'},
            weightScaleFeature: {type: 'boolean'},
            fanSpeed: {type: 'array'},
            heatingIntensity: {type: 'number'},
        },
        validateProperty: {
            machineType: 'machineType',
            state: 'machineState',
        },
        required: [
            'guid',
            'modelId',
            'machineName',
            'costPerKwh',
            'country',
            'language',
            'scale',
            'timezone',
            'createdAt',
            'updatedAt',
            'categories',
        ],
        additionalProperties: false,
    },

    machineSettings: {
        type: 'object',
        properties: {
            fanSpeed: {type: 'array'},
            heatingIntensity: {type: 'number'},
        },
        required: [
            'fanSpeed',
            'heatingIntensity',
        ],
        additionalProperties: false,
    },


    machinePairData: {
        type: 'object',
        properties: {
            uid: {type: 'string'},
            // machine: {
            //     type: "object",
            //     properties: {
            //         model: { type: "string" },
            //         machineType: { type: "string" },
            //         brand: { type: "string" },
            //     },
            //     validateProperty: {
            //         machineType: "machineType",
            //     },
            //     required: ["model", "machineType", "brand"],
            //     additionalProperties: false,
            // },
        },
        required: ['uid' /*, "machine"*/],
        additionalProperties: false,
    },

    machinePairDeviceData: {
        type: 'object',
        properties: {
            uid: {type: 'string'},
            language: {type: 'string'},
            timezone: {type: 'string'},
            country: {type: 'string'},
            currencySymbol: {type: 'string'},
            zones: {type: 'array'},
            model: {type: 'string'},
            weightScaleFeature: {type: 'boolean'},
            fanSpeed: {type: 'array'},
            heatingIntensity: {type: 'number'},
        },
        required: [
            'uid',
            'language',
            'timezone',
            'country',
            'zones',
            'model',
            'fanSpeed',
            'weightScaleFeature',
            'heatingIntensity',
        ],
        additionalProperties: false,
    },

    machinePostData: {
        type: 'object',
        properties: {
            guid: {type: 'string'},
            modelId: {type: 'string'},
            costPerKwh: {type: 'number'},

            country: {type: 'string'},
            language: {type: 'string'},
            scale: {type: 'string'},
            timezone: {type: 'string'},

            machineType: {type: 'string'},
            machineName: {type: 'string'},
            categories: {type: 'array'},
        },
        validateProperty: {
            machineType: 'machineType',
        },
        required: [
            'guid',
            'modelId',
            'machineName',
            'machineType',
            'costPerKwh',
            'country',
            'language',
            'scale',
            'timezone',
            'categories',
        ],
        additionalProperties: false,
    },

    machineGroup: {
        type: 'object',
        properties: {
            id: {type: 'string'},
            creatorId: {type: 'string'},
            name: {type: 'string'},
            location: {type: 'string'},
            machineIds: {
                type: 'array',
                items: {type: 'string'},
            },
            createdAt: {type: 'number'},
            updatedAt: {type: 'number'},
        },
        required: [
            'creatorId',
            'name',
            'location',
            'machineIds',
            'createdAt',
            'updatedAt',
        ],
        additionalProperties: false,
    },

    machineGroupPostData: {
        type: 'object',
        properties: {
            name: {type: 'string'},
            location: {type: 'string'},
            machineIds: {
                type: 'array',
                items: {type: 'string'},
            },
        },
        required: ['name', 'location'],
        additionalProperties: false,
    },

    user: {
        type: 'object',
        properties: {
            uid: {type: 'string'},
            parentsId: {type: 'array'},
            firstName: {type: 'string'},
            lastName: {type: 'string'},
            email: {type: 'string', format: 'email'},
            role: {type: 'string'},
            country: {type: 'string'},
            timezone: {type: 'string'},
            language: {type: 'string'},
            scale: {type: 'string'},
            createdAt: {type: 'number'},
            updatedAt: {type: 'number'},
            isInvitation: {type: 'boolean'},
            groups: {type: 'array'},
            fcmTokens: {type: 'array'},
            machines: {type: 'array'},
            access: {type: 'array'},
            authType: {type: 'string'},
            currencySymbol: {type: 'string'},
        },
        validateProperty: {
            role: 'role',
        },
        required: [
            'uid',
            'firstName',
            'lastName',
            'email',
            'role',
            'country',
            'language',
            'scale',
            'createdAt',
            'updatedAt',
        ],
        additionalProperties: false,
    },

    userPostData: {
        type: 'object',
        properties: {
            uid: {type: 'string'},
            parentsId: {type: 'array'},
            firstName: {type: 'string'},
            lastName: {type: 'string'},
            email: {type: 'string', format: 'email'},
            role: {type: 'string'},
            country: {type: 'string'},
            language: {type: 'string'},
            scale: {type: 'string'},
        },
        validateProperty: {
            role: 'role',
        },
        required: [
            'uid',
            'firstName',
            'lastName',
            'email',
            'country',
            'language',
            'scale',
        ],
        additionalProperties: false,
    },

    machineAccess: {
        type: 'object',
        properties: {
            id: {type: 'string'},
            userId: {type: 'string'},
            machineGroupId: {type: 'string'},
            machineId: {type: 'string'},

            permissionLevel: {type: 'string'},
        },
        validateProperty: {
            permissionLevel: 'permissionLevel',
        },
        required: ['userId', 'permissionLevel'],
        additionalProperties: false,
    },

    machineAccessPostData: {
        type: 'object',
        properties: {
            userId: {type: 'string'},
            email: {type: 'string', format: 'email'},
            machineGroupId: {type: 'string'},
            machineId: {type: 'string'},
            permissionLevel: {type: 'string'},
        },
        validateProperty: {
            permissionLevel: 'permissionLevel',
        },
        required: ['permissionLevel'],
        additionalProperties: false,
    },

    machineReceiveMessagePostData: {
        type: 'object',
        properties: {
            machineUid: {type: 'string'},
            moduleNumber: {type: 'number'},
            uuid: {type: 'string'},
            message: {type: 'string'},
            code: {type: 'number'},
            timestamp: {type: 'number'},
            params: {type: 'object', additionalProperties: true },
        },
        required: [
            'machineUid',
            'moduleNumber',
            'uuid',
            'message',
            'code',
            'timestamp',
            'params'
        ],
        additionalProperties: false,
    },

    recipeIngredients: {
        type: 'object',
        properties: {
            action: {type: 'string'},
            description: {type: 'string'},
            media_resource: {type: ['string' , 'null']},
        },
        required: ['action', 'description'],
        additionalProperties: false,
    },

    stages: {
        type: 'object',
        properties: {
            duration: {type: ['number', 'null']},
            initTemperature: {type: 'number'},
            weight: {type: ['number', 'null']},
            fanPerformance1: {type: 'number'},
            fanPerformance2: {type: 'number'},
            fanPerformance1Label: {type: 'string'},
            fanPerformance2Label: {type: 'string'},
            heatingIntensity: {type: ['number', 'null']},
        },
        required: ['initTemperature'],
        additionalProperties: false,
    },

    // zoneParams: {
    //     type: 'object',
    //     properties: {
    //         initTemperature: {type: 'number'},
    //         heatingIntensity: {type: 'number'},
    //         fanPerformance1: {type: 'number'},
    //         fanPerformance2: {type: 'number'},
    //         duration: {type: 'number'},
    //         weight: {type: 'number'},
    //     },
    //     required: [
    //         'initTemperature',
    //         'heatingIntensity',
    //         'fanPerformance1',
    //         'fanPerformance2',
    //     ],
    // },

    cycleScheduleData: {
        type: 'object',
        properties: {
            machineId: {type: 'string'},
            recipeId: {type: 'string'},
            zoneNumber: {type: 'number'},
            scheduledTime: {type: 'number'},
            params: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        initTemperature: {type: 'number'},
                        heatingIntensity: {type: 'number'},
                        fanPerformance1: {type: 'number'},
                        fanPerformance2: {type: 'number'},
                        fanPerformance1Label: {type: 'string'},
                        fanPerformance2Label: {type: 'string'},
                        duration: {type: 'number'},
                        weight: {type: 'number'},
                    },
                    required: [
                        'initTemperature',
                        'heatingIntensity',
                    ],
                },
            },
            status: {type: 'string'},
        },
        validateProperty: {
            status: 'status',
        },
        required: ['machineId', 'zoneNumber', 'scheduledTime'],
        additionalProperties: false,
    },

    cycleData: {
        type: 'object',
        properties: {
            id: {type: 'string'},
            machineId: {type: 'string'},
            recipeId: {type: ['string', 'null']},
            zoneNumber: {type: 'number'},
            scheduledTime: {type: 'number'},
            params: {
                type: ['array', 'null'],
                items: {
                    type: 'object',
                    properties: {
                        initTemperature: {type: 'number'},
                        heatingIntensity: {type: 'number'},
                        fanPerformance1: {type: 'number'},
                        fanPerformance2: {type: 'number'},
                        fanPerformance1Label: {type: 'string'},
                        fanPerformance2Label: {type: 'string'},
                        duration: {type: 'number'},
                        weight: {type: 'number'},
                    },
                    required: [
                        'initTemperature',
                        'heatingIntensity',
                    ],
                },
            },
            status: {type: 'string'},
        },
        validateProperty: {
            status: 'status',
        },
        required: ['machineId', 'zoneNumber', 'scheduledTime', 'status'],
        additionalProperties: false,
    },
};
