// import { cookies } from "next/headers";

import {verify} from '../utils/token';
import container from '../di/container';
import {ErrorCode, GUEST_IDENTITY} from '@/src/constants';
import {ROLE} from '@/acl/types';
import {IUser} from '../models/User';
import UserService from '../services/UserService';
import MachineService from '../services/MachineService';
import {IMachine} from '../models/Machine';

const sendError = (res, message, code = 400) => {
    if (typeof res.status != 'undefined') {
        return res.status(code).json({
            error: {
                message: message,
                code,
            },
        });
    } else {
        return {
            props: {
                error: {
                    message: message,
                    code,
                },
            },
        };
    }
};

const authTokenCheck = async (req, res, next) => {
    //console.time("TIMER:AUTHTOKENCHECK");
    // console.log('authTokenCheck', req?.url);
    let cookieToken = req?.cookies?.token;
    const [scheme, headersToken] =
        req?.headers?.authorization != null &&
        req?.headers?.authorization != undefined
            ? req.headers.authorization.split(' ')
            : [null, null];

    // console.log('headersToken', headersToken);
    const token = headersToken ?? cookieToken;
    if (!token) {
        return sendError(res, ErrorCode.NoTokenProvided, 401);
    }
    req.identity = GUEST_IDENTITY;
    if (token) {
        const payload = verify(token);
        const mid = payload['mid'];
        let machineOwner = undefined;
        if (mid) {
            const MachineService =
                container.resolve<MachineService>('MachineService');
            const machine: IMachine =
                await MachineService.findMachineByGuidIfExist(mid);
            if (machine) {
                req.identity = {
                    userId: ROLE.MACHINE,
                    role: ROLE.MACHINE,
                    locale: machine.language,
                    timezone: machine.timezone,

                    languageCode: machine.language,
                    countryCode: machine.country,
                    scale: machine.scale,
                };
                machineOwner = machine.ownerId;
            }
        }
        const uid = payload['uid'] ?? machineOwner;
        if (uid) {
            const UserService = container.resolve<UserService>('UserService');
            console.log('uid', uid);
            const user: IUser = await UserService.findUserInfo(uid);
            if (user != null) {
                req.identity = {
                    token: token,
                    userId: user.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    userEmail: user.email,
                    secret: user.email.replaceAll('.', '@'),
                    locale: user.language,
                    timezone: user.country,

                    languageCode: user.language,
                    countryCode: user.country,
                    scale: user.scale,
                };
            }
        }
    }

    //   else {
    //     return sendError(res, ErrorCode.NoUserForId, 401);
    //   }
    // } else {
    //   return sendError(res, ErrorCode.TokenNotVerify, 401);
    // }

    //console.timeEnd("TIMER:AUTHTOKENCHECK");
    if (typeof document == 'undefined') {
        return next();
    } else {
        next();
    }
};

export default authTokenCheck;
