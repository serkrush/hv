import getConfig from 'next/config';
import prodServiceAccount from '../../serviceAccountKey.json';
import devServiceAccount from '../../serviceAccountKeyDev.json';

const {
    publicRuntimeConfig: {ENVIRONMENT},
} = getConfig();

export default function getServiceAccountKey() {
    switch (ENVIRONMENT) {
    case 'dev':
        return devServiceAccount;
    case 'prod':
        return prodServiceAccount;
    default:
        return devServiceAccount;
    }
}

export function projectId() {
    return getServiceAccountKey().projectId;
}
