import {call, put} from 'redux-saga/effects';
import {BaseEntity, HTTP_METHOD} from './BaseEntity';
import * as actionTypes from '@/store/types/actionTypes';
import action from './decorators/action';
import reducer from './decorators/reducer';
import {DEFAULT_INVITATION_ROLE, DEFAULT_ROLE, Flag, RequestStatus} from '../constants';
import {UserInteractMode} from '../components/Form/UserForm';
import type {IOptions, IPagerParams} from '../pagination/IPagerParams';
import type {IUserEntity} from './EntityTypes';
import alias from './decorators/alias';
import {AuthType, ROLE} from '@/acl/types';
import Router from 'next/router';
import { firebaseErrors } from '../utils/firebaseErrors';
import { IUser } from '@/server/models/User';
import { schema } from 'normalizr';

@alias('UserEntity')
@reducer('users')
export default class UserEntity extends BaseEntity<UserEntity> {
    constructor(opts: any) {
        super(opts);
        const groups = new schema.Entity('machineGroups', {}, {});
        const machines = new schema.Entity('machines', {}, {});
        const accesses = new schema.Entity('machineAccess', {}, {});
        const relations = new schema.Entity('users', {}, {idAttribute: 'uid'});
        this.initSchema('users', {
            groups: [groups],
            machines: [machines],
            access: [accesses],
            relations: [relations]
        }, {idAttribute: 'uid'});
    }

    public getRolesOptions(): IOptions[] {
        return [
            {label: ROLE.USER, value: ROLE.USER},
            {label: ROLE.OWNER, value: ROLE.OWNER},
            {label: ROLE.ROOT, value: ROLE.ROOT},
        ];
    }

    @action()
    public *fetchUser({id}: {id: string}) {
        yield call(this.xRead, `/users/${id}`);
    }
    
    @action()
    public *fetchUsersPage(data: IPagerParams) {
        yield call(this.pageEntity, `/users/page`, data);
    }

    @action()
    public *add({
        email,
        firstName,
        lastName,
        password,
        country,
        language,
        scale,
        role = DEFAULT_ROLE,
        parentsId = undefined as undefined | string[],
    }: Omit<IUserEntity, 'uid'> & {password: string}) {
        yield put(
            actionTypes.setRequestStatus({
                entityName: this.entityName,
                actionType: actionTypes.ADD,
                status: RequestStatus.LOADING,
            }),
        );
        const {Firebase, t, ToastEmitter} = this.di;
        const res = yield call(Firebase.signIn, email, password);
        if (res.error) {
            ToastEmitter.errorMessage(
                t(res.titleCode) + '\n' + t(res.messageCode),undefined, true
            );
            yield put(
                actionTypes.setRequestStatus({
                    entityName: this.entityName,
                    actionType: actionTypes.ADD,
                    status: RequestStatus.ERROR,
                    data: res.error,
                }),
            );
        } else if (res.user) {
            const uid = res.user.uid;
            const result = {
                uid,
                email,
                firstName,
                lastName,
                role,
                scale,
                country,
                language,
            };

            if (parentsId) {
                result['parentsId'] = parentsId;
            }
            const resData = yield call(this.xSave, `/users/add`, result);
            if (resData.success) {
                yield call(Router.replace, `/home/users/${uid}?mode=edit`)
                ToastEmitter.message('success-add-user');
            } else {
                if (resData?.response?.error) {
                    ToastEmitter.errorMessage(resData?.response?.error);
                }
            }
        }
    }

    @action()
    public *update(user: IUserEntity) {
        const {t, ToastEmitter} = this.di;
        console.log("USER", user)
        delete (user as any)?.groups;
        delete (user as any)?.machines;
        delete (user as any)?.access;
        delete (user as any)?.relations;
        delete (user as any)?.type;
        console.log("USER", user)
        const resData = yield call(
            this.xSave,
            `/users/${user.uid}/update/data`,
            {
                data: {...user},
            },
        );
        if (resData.success) {
            ToastEmitter.message('success-edit-user');
        } else {
            if (resData?.response?.error) {
                ToastEmitter.errorMessage(resData?.response?.error);
            }
        }
    }

    @action()
    public *updatePassword({uid, password}: {uid: string; password: string}) {
        const {t, ToastEmitter} = this.di;

        const resData = yield call(
            this.xSave,
            `/users/${uid}/update/password`,
            {
                data: password,
            },
        );
        if (resData.success) {
            ToastEmitter.message('success-edit-user');
        } else {
            if (resData?.response?.error) {
                ToastEmitter.errorMessage(resData?.response?.error);
            }
        }
    }

    @action()
    public *delete({uid, checkFlag}: {uid: string; checkFlag: string}) {
        const {t, ToastEmitter} = this.di;
        yield put(actionTypes.setFlagger(checkFlag, Flag.ACTION_START));

        const resData = yield call(this.xDelete, `/users/${uid}/delete`, {});
        if (resData.success) {
            ToastEmitter.message('success-delete-user');
            yield put(actionTypes.setFlagger(checkFlag, Flag.ACTION_SUCCESS));
        } else {
            this.handleUnsuccessResponse(resData.response);
        }
    }

    @action()
    public *get({uid}: {uid: string}) {
        const resData = yield call(this.xRead, `/users/${uid}`, {});
        if (resData.success) {
        } else {
            if (resData?.response?.error) {
            }
        }
    }

    @action()
    public *invitationConfirm({
        invitationId,
        email,
        firstName,
        lastName,
        password,
        timezone,
        language,
        scale,
        parentsId = undefined,
    }: Omit<IUserEntity, 'uid'> & {password: string; invitationId: string}) {
        yield put(
            actionTypes.setRequestStatus({
                entityName: this.entityName,
                actionType: actionTypes.ADD,
                status: RequestStatus.LOADING,
            }),
        );
        const {Firebase, t, ToastEmitter} = this.di;
        let isInFirebaseExist = false;
        let existedUser: IUser;
        let uid = "";

        let firebaseResult = yield call(Firebase.signIn, email, password); 
        if (firebaseResult.error) {
            if(firebaseResult.error.code === firebaseErrors.AUTH_EMAIL_ALREADY_IN_USE) {
                isInFirebaseExist = true; // if exist in firebase
            }
            else {
                ToastEmitter.errorMessage(
                    t(firebaseResult.titleCode) + '\n' + t(firebaseResult.messageCode),undefined, true
                );
                yield put(
                    actionTypes.setRequestStatus({
                        entityName: this.entityName,
                        actionType: actionTypes.ADD,
                        status: RequestStatus.ERROR,
                        data: firebaseResult.error,
                    }),
                );
            }
            
        }

        const resData = yield call(this.xRead, `/users/invitation/${invitationId}`);
        if(resData.success) {
            existedUser = resData?.response?.data; // existed in user collection
        }

        // if user in user collection -> need to add to auth and update new uid email pass in user coll
        if (existedUser && !isInFirebaseExist && firebaseResult.user) { 
            // if in users collection and not in auth, we need to update new credentials in user collections
            yield call(
                this.xSave,
                `/users/${existedUser.uid}/update/data`,
                {
                    data: {...existedUser, 
                        uid: firebaseResult.user.uid, 
                        email, 
                        firstName, 
                        lastName,
                        language,
                        timezone,
                        scale},
                },
            );
            uid = firebaseResult.user.uid;
        }
        // if user doesn`t exist in any collections, need to add in both
        else if(!existedUser && firebaseResult.user) { // if he hasn`t been existed in user collection and in auth
            // if user has just been registered in Firebase
            uid = firebaseResult.user.uid;
        }
        // if user in auth -> need to add in user collection
        else if(!existedUser && isInFirebaseExist) {
            // get from firebase credentials and add in collection
            let firebaseResult = yield call(Firebase.login, email, password, true);
            if (firebaseResult.error) {
                ToastEmitter.errorMessage(
                    t(firebaseResult.titleCode) + '\n' + t(firebaseResult.messageCode),undefined, true
                );
                yield put(
                    actionTypes.setRequestStatus({
                        entityName: this.entityName,
                        actionType: actionTypes.ADD,
                        status: RequestStatus.ERROR,
                        data: firebaseResult.error,
                    }),)
                return {};
            }
            uid = firebaseResult;
        }

        if(uid && !existedUser) {
            const result = {
                uid,
                email,
                firstName,
                lastName,
                role: DEFAULT_INVITATION_ROLE,
                scale,
                timezone,
                language,
                authType: AuthType.Default,
            };

            if (parentsId) {
                result['parentsId'] = parentsId;
            }
            yield call(this.xSave, `/register`, result);
        }

        const confirmData = yield call(
            this.xSave,
            `/invitations/${invitationId}/accept`,
            {
                data: {uid, email},
            },
        );
    
        if (confirmData.success) {
            ToastEmitter.message('invite-confirmed-success');
            yield put(
                actionTypes.setFlagger(Flag.InviteConfirmedSuccess, invitationId),
            );
        } else {
            if (confirmData?.response?.error) {
                ToastEmitter.errorMessage(confirmData?.response?.error);
            } else {
                yield call(Router.replace, `/error/500`);
            }
        }   
    }
}
