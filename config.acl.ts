if (typeof document !== 'undefined') {
    throw new Error('Do not import `config.js` from inside the client-side code.');
}

import { ROLE, GRANT, IRoles, IRules } from './acl/types';

export const SUPER = [ROLE.ROOT];

export const roles: IRoles = {
    [ROLE.GUEST]: {
        display: 'guest',
        url: '',
    },

    [ROLE.MACHINE]: {
        display: 'machine',
        parent: [ROLE.GUEST],
        url: '/',
        private: true,
    },

    [ROLE.USER]: {
        display: 'user',
        parent: [ROLE.MACHINE],
        url: '/',
    },

    [ROLE.OWNER]: {
        display: 'owner',
        parent: [ROLE.USER],
        url: '/',
    },

    [ROLE.ROOT]: {
        display: 'Admin',
        parent: [ROLE.OWNER],
        url: '/',
        private: true,
    },
};

export const rules: IRules = {
    /*****************************************************************************************
    ************************************* Other Resources ********************************
    ******************************************************************************************/

    // 'socket/*': {
    //     allow: {
    //         [ROLE.USER] : [GRANT.READ],
    //     }
    // },

    'request/*': {
        allow: {
            [ROLE.USER] : [GRANT.READ],
        }
    },

    /*****************************************************************************************
    ************************************* MENU and navigation ********************************
    ******************************************************************************************/

    "NavigationMenu/*/*/*": {
        allow: {
            [ROLE.ROOT]: [GRANT.READ]
        }
    },

    // 'MainMenu/*/*': {
    //     allow: {
    //         [ROLE.GUEST]: [GRANT.READ],
    //     }
    // },

    /*****************************************************************************************
    ************************************* ROUTES / URLs resources ****************************
    ******************************************************************************************/

    '/': {
        allow: {
            [ROLE.GUEST]: [GRANT.READ, GRANT.GET],
        },
    },

   

    // '/login': {
    //     allow: {
    //         [ROLE.GUEST]: [GRANT.READ, GRANT.GET],
    //     },
    // },
};
