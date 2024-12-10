import {GRANT} from '@/acl/types';
import {PermissionLevel} from '../models/MachineAccess';

const grantsForPermissionLevel = (
    permissionLevel: PermissionLevel,
    isOwner: boolean,
): GRANT[] => {
    if (isOwner) {
        return [GRANT.VIEWER, GRANT.USER, GRANT.ADMIN, GRANT.OWNER];
    }
    switch (permissionLevel) {
        case PermissionLevel.Viewer:
            return [GRANT.VIEWER];
        case PermissionLevel.User:
            return [GRANT.VIEWER, GRANT.USER];
        case PermissionLevel.Admin:
            return [GRANT.VIEWER, GRANT.USER, GRANT.ADMIN];
        case PermissionLevel.SuperAdmin:
            return [GRANT.VIEWER, GRANT.USER, GRANT.ADMIN];
    }
};

export default grantsForPermissionLevel;
