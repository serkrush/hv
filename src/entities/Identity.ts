import { call, put } from "redux-saga/effects";
import { BaseEntity, HTTP_METHOD } from "./BaseEntity";
import * as actionTypes from "@/store/types/actionTypes";
import action from "./decorators/action";
import { DEFAULT_ROLE, Flag, RequestStatus } from "../constants";
import { schema } from "normalizr";
import { deleteCookie, setCookie } from "cookies-next";
import alias from "./decorators/alias";
import Router from "next/router";
import { IUserEntity } from "./EntityTypes";

@alias("Identity")
export default class Identity extends BaseEntity<Identity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema("identity")
    }

    @action()
    public *autologin({ router }) {
        const { Firebase, t, ToastEmitter } = this.di;
        try {
            const resData = yield call(
                this.xRead,
                `/autologin`,
                {},
                HTTP_METHOD.POST
            );
            if (resData.success) {
                const userRole = resData?.response?.data?.userData?.role;
                setCookie("token", resData?.response?.data?.identity?.token);
                yield put(actionTypes.updateAuth(resData.response.data));
                router.push("/home/users");
                return;
            }

            const res = yield call(Firebase.tryAutoLogin);
            if (res?.error) {
                ToastEmitter.errorMessage(
                    t(res.titleCode) + "\n" + t(res.messageCode),undefined, true
                );
            } else if (res == null || res == undefined) {
            } else {
                const resData = yield call(
                    this.xRead,
                    `/login`,
                    { idToken: res },
                    HTTP_METHOD.POST
                );

                if (resData.success) {
                    setCookie(
                        "token",
                        resData?.response?.data?.identity?.token
                    );
                    const userRole = resData?.response?.data?.userData?.role;
                    yield put(actionTypes.updateAuth(resData.response.data));
                    yield put(
                        actionTypes.setFlagger(
                            Flag.SelectedNavOption,
                            undefined
                        )
                    );
                    router.push("/home/users");
                    // } else {
                    //     ToastEmitter.errorMessage(t("no-access"));
                    // }
                } else {
                    if (resData?.response?.error) {
                        ToastEmitter.errorMessage(resData?.response?.error);
                    }
                }
            }
        } catch (error) {
            console.log("login error", error);
        }
    }
    
    @action()
    public *login({ email, password, router }) {
        const { Firebase, t, ToastEmitter } = this.di;
        const res = yield call(Firebase.login, email, password);
        if (res?.error) {
            ToastEmitter.errorMessage(
                t(res.titleCode) + "\n" + t(res.messageCode),undefined, true
            );
        } else {
            const resData = yield call(
                this.xRead,
                `/login`,
                { idToken: res },
                HTTP_METHOD.POST
            );

            if (resData.success) {
                yield put(
                    actionTypes.setRequestStatus({
                        entityName: "identity",
                        status: RequestStatus.LOADING,
                        actionType: actionTypes.GET,
                        data: {},
                    }),
                );
                yield call(router.push, "/home/users");
                setCookie("token", resData?.response?.data?.identity?.token);
                yield put(actionTypes.updateAuth(resData.response.data));
            }
        }
    }

    @action()
    public *logout() {
        const { Firebase, t, ToastEmitter } = this.di;
        const res = yield call(Firebase.logout);
        if (res?.error) {
            ToastEmitter.errorMessage(
                t(res.titleCode) + " " + t(res.messageCode),undefined, true
            );
        } else {
            yield call(Router.replace, "/");
            yield call(deleteCookie, "token");
            yield put(actionTypes.resetAuth());
            yield put(BaseEntity.clear());
            yield put(actionTypes.allPageClear());
            yield put(actionTypes.deleteFlaggers());
        }
    }

    @action()
    public *setCurrentNavOption({ value }) {
        yield put(actionTypes.setFlagger(Flag.SelectedNavOption, value));
    }

    @action()
    public *updateIdentity() {
        const resData = yield call(
            this.xRead,
            `/auth/update-identity`,
            {},
            HTTP_METHOD.POST
        );

        if (resData.success) {
            setCookie("token", resData?.response?.data?.identity?.token);
            yield put(actionTypes.updateAuth(resData.response.data));
        }
    }

    @action()
    public *register({
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
                    data: res.error
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
            const resData = yield call(this.xSave, `/register`, result);
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
}
