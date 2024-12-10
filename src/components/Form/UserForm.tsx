import {IInvitation} from '@/server/models/Invitation';
import {
    CheckError,
    checkOnePasswordFormat,
} from '@/server/utils/checkPasswordFormat';
import ContainerContext from '@/src/ContainerContext';
import {
    AppState,
    DEFAULT_COUNTRY,
    DEFAULT_LANGUAGE_CODE,
    DEFAULT_ROLE,
    DEFAULT_SCALE,
    DEFAULT_TIMEZONE,
    Modals,
    countriesCodes,
    languages,
    roles,
    scales,
    timezones,
} from '@/src/constants';
import {IUserEntity} from '@/src/entities/EntityTypes';
import {useActions} from '@/src/hooks/useEntity';
import {setFlagger} from '@/store/types/actionTypes';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/20/solid';
import {useFormik} from 'formik';
import {useContext, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ConfirmationDialog from '../ConfirmationDialog';
import Label from '../Label';
import {ButtonSubmitting} from './ButtonSubmitting';
import Input from './Input';
import Select from './Select';
import * as actionTypes from '@/store/types/actionTypes';

export enum UserInteractMode {
    Add = 'add',
    Edit = 'edit',
    Confirm = 'confirm',
    View = 'view',
}

interface iUserFormProps {
    user?: IUserEntity | undefined;
    invitation?: IInvitation | undefined;
    mode: UserInteractMode;
    deleteCheckFlag?: string;
}

export default function UserForm({
    user = undefined as IUserEntity | undefined,
    invitation = undefined as IInvitation | undefined,
    mode = UserInteractMode.Add,
    deleteCheckFlag = 'DELETE_USER',
}: iUserFormProps) {
    const di = useContext(ContainerContext);
    const t = di.resolve('t');
    const dispatch = useDispatch();
    const isInvitation = user?.isInvitation ?? false;

    const identity = useSelector((state: AppState) => state.auth.identity);
    const users = useSelector((state: AppState) => {
        return state.users;
    });

    const currentUser = useMemo(() => {
        return identity != undefined && identity.userId != undefined
            ? users[identity.userId]
            : undefined;
    }, [users, identity]);

    const validate = values => {
        const errors: any = {};
        if (!values.email || values.email == '') {
            errors.email = t('required');
        }

        if (!values.firstName || values.firstName == '') {
            errors.firstName = t('required');
        }
        if (!values.lastName || values.lastName == '') {
            errors.lastName = t('required');
        }
        if (!values.country || values.country == '') {
            errors.country = t('required');
        }
        if (!values.timezone || values.timezone == '') {
            errors.timezone = t('required');
        }
        if (!values.scale || values.scale == '') {
            errors.scale = t('required');
        }
        if (!values.language || values.language == '') {
            errors.language = t('required');
        }
        if (!values.currentRole || values.currentRole == '') {
            errors.currentRole = t('required');
        }

        if (mode == UserInteractMode.Add || mode == UserInteractMode.Confirm) {
            if (!values.password || values.password == '') {
                errors.password = t('required');
            }

            if (!values.confirmPassword || values.confirmPassword == '') {
                errors.confirmPassword = t('required');
            }
            if (
                checkOnePasswordFormat(values.password, error => {
                    switch (error) {
                    case CheckError.DontMatch:
                        errors.confirmPassword = t(
                            'password-dont-match-alert-message',
                        );
                        break;
                    case CheckError.InvalidLength:
                        errors.password = t(
                            'password-invalid-length-alert-message',
                        );

                        break;
                    case CheckError.InvalidCases:
                        errors.password = t(
                            'password-invalid-cases-alert-message',
                        );

                        break;
                    case CheckError.DigitRequire:
                        errors.password = t(
                            'password-invalid-digit-alert-message',
                        );
                        break;
                    default:
                        errors.password = t('default-error-title');
                        break;
                    }
                })
            ) {
                if (values.password != values.confirmPassword) {
                    errors.confirmPassword = t(
                        'password-dont-match-alert-message',
                    );
                }
            }
        }

        return errors;
    };

    const {delete: deleteUser} = useActions('UserEntity');

    const {
        add: addUser,
        update: updateUserInfo,
        updatePassword: updateUserPassword,
        invitationConfirm,
    } = useActions('UserEntity');

    const [showPass, setShowPass] = useState(false);

    const onConfirmButtonTap = values => {
        const {
            email,
            password,
            firstName,
            lastName,
            country,
            scale,
            language,
            timezone,
            currentRole,
        } = values;
        switch (mode) {
        case UserInteractMode.Confirm:
            invitationConfirm!({
                invitationId: invitation?.id,
                ...user,
                email,
                firstName,
                lastName,
                country,
                password,
                scale,
                language,
                timezone
            });
            break;
        case UserInteractMode.Add:
            addUser!({
                email,
                password,
                firstName,
                lastName,
                role: currentRole,
                country,
                scale,
                language,
                timezone,
                parentsId: [
                    // ...(currentUser?.parentsId ?? []),
                    // ...(identity?.userId ? [identity?.userId] : []),
                ],
            });
            break;
        case UserInteractMode.Edit:
            updateUserInfo!({
                ...user,
                email,
                firstName,
                lastName,
                role: currentRole,
                country,
                scale,
                language,
                timezone
            });
            break;
        }
    };

    const formik = useFormik({
        initialValues: {
            email: user?.email ?? '',
            country: user?.country ?? DEFAULT_COUNTRY,
            language: user?.language ?? DEFAULT_LANGUAGE_CODE,
            scale: user?.scale ?? DEFAULT_SCALE,
            currentRole: user?.role ?? DEFAULT_ROLE,
            timezone: user?.timezone ?? DEFAULT_TIMEZONE,
            password: '',
            confirmPassword: '',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
        },
        validate,
        onSubmit: onConfirmButtonTap,
    });
    const handleChange = event => {
        formik.setErrors({});
        formik.handleChange(event);
    };

    const updatePassword = () => {
        const password = formik.values.password;
        const confirmPassword = formik.values.confirmPassword;

        updateUserPassword({uid: user?.uid, password});
    };

    const reset = () => {
        formik.resetForm({
            values: {
                email: '',
                country: DEFAULT_COUNTRY,
                language: DEFAULT_LANGUAGE_CODE,
                timezone: DEFAULT_TIMEZONE,
                scale: DEFAULT_SCALE,
                currentRole: DEFAULT_ROLE,
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
            },
            errors: {},
        });
    };

    useEffect(() => {
        formik.resetForm({
            values: {
                email: user?.email ?? '',
                country: user?.country ?? DEFAULT_COUNTRY,
                language: user?.language ?? DEFAULT_LANGUAGE_CODE,
                scale: user?.scale ?? DEFAULT_SCALE,
                currentRole: user?.role ?? DEFAULT_ROLE,
                timezone: user?.timezone ?? DEFAULT_TIMEZONE,
                password: '',
                confirmPassword: '',
                firstName: user?.firstName ?? '',
                lastName: user?.lastName ?? '',
            },
            errors: {}
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const passwordFields = (
        <div className="flex w-full min-w-64 flex-row items-end justify-between gap-x-10 mb-4">
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <Label name="password" value={t('field-password')} />
                </div>
                <div className="mt-2">
                    <Input
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={handleChange}
                        required={true}
                        error={formik.errors.password as string}
                    />
                </div>
            </div>
            <div className="flex-1">
                <Label
                    name="confirmPassword"
                    value={t('field-confirm-password')}
                />
                <div className="mt-2">
                    <Input
                        name="confirmPassword"
                        type="password"
                        value={formik.values.confirmPassword}
                        onChange={handleChange}
                        required={true}
                        error={formik.errors.confirmPassword as string}
                    />
                </div>
            </div>
        </div>
    );

    const deleteUserFunc = () => {
        dispatch(
            setFlagger(Modals.DeleteUser, {
                uid: user?.uid,
                checkFlag: deleteCheckFlag,
            }),
        );
    };

    return (
        <form onSubmit={formik.handleSubmit} className='w-full'>
            <ConfirmationDialog
                onOkAction={data => {
                    deleteUser(data);
                }}
                title={t('delete-user')}
                flagerKey={Modals.DeleteUser}
            />
            <div className="w-full"></div>
            <div>
                <Label name="firstName" value={t('field-first-name')} />
                <div className="mt-2">
                    <Input
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={handleChange}
                        required={true}
                        error={formik.errors.firstName as string}
                    />
                </div>
            </div>
            <div>
                <Label name="lastName" value={t('field-last-name')} />
                <div className="mt-2">
                    <Input
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={handleChange}
                        required={true}
                        error={formik.errors.lastName as string}
                    />
                </div>
            </div>
            <div>
                <Label name="email" value={t('field-email')} />
                <div className="mt-2">
                    <Input
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={handleChange}
                        required={true}
                        readOnly={mode == 'confirm'}
                        error={formik.errors.email as string}
                    />
                </div>
            </div>
            <div>
                {mode != 'confirm' && (
                    <div>
                        <Label name="role" value={t('field-role')} />
                        <Select
                            name={'currentRole'}
                            data={roles.filter(item => {
                                if(formik.values.currentRole !== 'user') {
                                    return item !== 'user'
                                }
                                else {
                                    return true;
                                }
                            }).map(item => {
                                return {
                                    label: t(`role-${item}`),
                                    value: item,
                                };
                            })}
                            value={formik.values.currentRole}
                            onChange={handleChange}
                            required={true}
                            error={formik.errors.role as string}
                        />
                    </div>
                )}
                <Label name="language" value={t('field-language')} />
                <Select
                    name={'language'}
                    data={languages.map(item => {
                        return {label: t(`language_${item}`), value: item};
                    })}
                    value={formik.values.language}
                    onChange={handleChange}
                    required={true}
                    error={formik.errors.language as string}
                />
                <Label name="country" value={t('field-country')} />
                <Select
                    name={'country'}
                    data={countriesCodes.map(item => {
                        return {label: t(`country_${item}`), value: item};
                    })}
                    value={formik.values.country}
                    onChange={handleChange}
                    required={true}
                    error={formik.errors.country as string}
                />
                <Label name="timezone" value={t('field-timezone')} />
                <Select
                    name={'timezone'}
                    data={timezones.map(item => {
                        return {label: item, value: item};
                    })}
                    value={formik.values.timezone}
                    onChange={handleChange}
                    required={true}
                    error={formik.errors.timezone as string}
                />
                <Label name="scale" value={t('field-scale')} />
                <Select
                    name={'scale'}
                    data={scales.map(item => {
                        return {label: t(`scale_${item}`), value: item};
                    })}
                    value={formik.values.scale}
                    onChange={handleChange}
                    required={true}
                    error={formik.errors.scale as string}
                />
            </div>
            {(mode == 'add' || mode == 'confirm') && passwordFields}

            <div className="flex w-full place-content-center justify-center pt-5">
                <div className="flex w-1/4 min-w-48 max-w-64 text-sm">
                    <ButtonSubmitting
                        actionType={actionTypes.ADD}
                        entityName={'users'}
                        translationLabel={'save'}
                    />
                </div>
            </div>
            {mode == 'add' && (
                <div className="flex w-full place-content-center justify-center py-2">
                    <button
                        onClick={reset}
                        className="flex w-1/4 min-w-48 max-w-64 justify-center rounded-md bg-red-300 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                        {t('reset')}
                    </button>
                </div>
            )}
            {mode == 'edit' && !isInvitation && (
                <div className="">
                    <div
                        onClick={() => {
                            setShowPass(!showPass);
                        }}
                        className="flex flex-row items-center">
                        <div className="font-semibold text-black">
                            {t('update-password')}
                        </div>
                        {!showPass && (
                            <ChevronDownIcon
                                className="ml-2 h-5 w-5 text-black"
                                aria-hidden="true"
                            />
                        )}
                        {showPass && (
                            <ChevronUpIcon
                                className="ml-2 h-5 w-5 text-black"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                    {showPass && (
                        <div>
                            {passwordFields}
                            <div className="flex w-full place-content-center justify-center py-2">
                                <div className="w-64 text-sm">
                                    <ButtonSubmitting
                                        actionType={actionTypes.ADD}
                                        onClick={updatePassword}
                                        type="button"
                                        entityName={'users'}
                                        translationLabel={'save'}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {mode == 'edit' && (
                <div className="flex w-full place-content-center justify-center py-2">
                    <div className="flex w-1/4 min-w-48 max-w-64 text-sm">
                        <ButtonSubmitting
                            actionType={actionTypes.DELETE}
                            colorClassNames="bg-red-300 disabled:hover:bg-red-300 hover:bg-red-200 focus-visible:outline-red-400"
                            onClick={deleteUserFunc}
                            type="button"
                            entityName={'users'}
                            translationLabel={'delete'}
                        />
                    </div>
                </div>
            )}
        </form>
    );
}
