import React, {useContext} from 'react';
import {useActions} from '@/src/hooks/useEntity';
import {useState} from 'react';
import {IUser} from '@/server/models/User';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/20/solid';
import {
    DEFAULT_COUNTRY,
    DEFAULT_LANGUAGE_CODE,
    DEFAULT_ROLE,
    DEFAULT_SCALE,
    countriesCodes,
    languages,
    roles,
    scales,
} from '@/src/constants';
import checkPasswordFormat, {
    CheckError,
} from '@/server/utils/checkPasswordFormat';
import ContainerContext from '@/src/ContainerContext';
import {ADD, action} from '@/store/types/actionTypes';
import {connect} from 'react-redux';
import {IInvitation} from '@/server/models/Invitation';
import {ROLE} from '@/acl/types';
import {UserInteractMode} from './Form/UserForm';

const mapDispatchToProps = dispatch => {
    return {
        save: data => dispatch(action(ADD, {payload: data})),
    };
};

const mapStateToProps = state => {
    let userData = state?.identity?.userData;
    if (
        state.auth.identity != undefined &&
        state.auth.identity.userData != undefined &&
        state.auth.identity.userData.uid != undefined &&
        state.users != undefined
    ) {
        userData =
            state.users[state.auth.identity.userData.uid] ??
            state.auth.identity.userData;
    }

    return {userData};
};

function UserForm({
    user = undefined as IUser | undefined,
    invitation = undefined as IInvitation | undefined,
    mode = UserInteractMode.Add,
    deleteCheckFlag = 'DELETE_USER',
    userData,
}) {
    const di = useContext(ContainerContext);
    const t = di.resolve('t');
    const isInvitation = user?.isInvitation ?? false;
    const {delete: deleteUser} = useActions('UserEntity');

    const ToastEmitter = di.resolve('ToastEmitter');
    const {
        add: addUser,
        update: updateUserInfo,
        updatePassword: updateUserPassword,
        invitationConfirm,
    } = useActions('UserEntity');
    const [email, setEmail] = useState(user?.email ?? '');
    const [country, setCountry] = useState(user?.country ?? DEFAULT_COUNTRY);
    const [language, setLanguage] = useState(
        user?.language ?? DEFAULT_LANGUAGE_CODE,
    );
    const [scale, setScale] = useState(user?.scale ?? DEFAULT_SCALE);
    const [currentRole, setRole] = useState(user?.role ?? DEFAULT_ROLE);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [showPass, setShowPass] = useState(false);

    const checkPassword = () => {
        return checkPasswordFormat(password, confirmPassword, error => {
            switch (error) {
            case CheckError.DontMatch:
                ToastEmitter.errorMessage(
                    t('password-not-valide-alert-title') +
                        '\n' +
                        t('password-dont-match-alert-message'),
                    undefined, true);
                break;
            case CheckError.InvalidLength:
                ToastEmitter.errorMessage(
                    t('password-not-valide-alert-title') +
                        '\n' +
                        t('password-invalid-length-alert-message'),
                    undefined, true);
                break;
            case CheckError.InvalidCases:
                ToastEmitter.errorMessage(
                    t('password-not-valide-alert-title') +
                        '\n' +
                        t('password-invalid-cases-alert-message'),
                    undefined, true);
                break;
            case CheckError.DigitRequire:
                ToastEmitter.errorMessage(
                    t('password-not-valide-alert-title') +
                        '\n' +
                        t('password-invalid-digit-alert-message'),
                    undefined, true);
                break;
            default:
                ToastEmitter.errorMessage('default-error-title');
                break;
            }
        });
    };

    const onConfirmButtonTap = () => {
        switch (mode) {
        case UserInteractMode.Confirm:
            if (checkPassword()) {
                if (
                    email == '' ||
                    password == '' ||
                    firstName == '' ||
                    lastName == ''
                ) {
                    ToastEmitter.errorMessage(
                        t('default-error-title') + '\n' + t('empty-fields'),undefined, true
                    );
                } else {
                    invitationConfirm({
                        invitationId: invitation?.id,
                        ...user,
                        email,
                        firstName,
                        lastName,
                        country,
                        password,
                        scale,
                        language,
                    });
                }
            }
            break;
        case UserInteractMode.Add:
            if (checkPassword()) {
                if (
                    email == '' ||
                    password == '' ||
                    firstName == '' ||
                    lastName == ''
                ) {
                    ToastEmitter.errorMessage(
                        t('default-error-title') + '\n' + t('empty-fields'),undefined, true
                    );
                } else {
                    addUser({
                        email,
                        password,
                        firstName,
                        lastName,
                        role: currentRole,
                        country,
                        scale,
                        language,
                        parentsId: [
                            ...(userData?.parentsId ?? []),
                            ...(userData?.uid ? [userData?.uid] : []),
                        ],
                    });
                }
            }
            break;

        case UserInteractMode.Edit:
            updateUserInfo({
                ...user,
                email,
                firstName,
                lastName,
                role: currentRole,
                country,
                scale,
                language,
            });
            break;
        }
    };

    const updatePassword = () => {
        if (checkPassword()) {
            updateUserPassword({uid: user?.uid, password});
        }
    };

    const handleFirstNameChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setFirstName(event.target.value);
    };

    const handleLastNameChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setLastName(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setConfirmPassword(event.target.value);
    };

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(ROLE[event.target.value as keyof typeof ROLE]);
    };

    const handleCountryChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setCountry(event.target.value);
    };

    const handleLanguageChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setLanguage(event.target.value);
    };

    const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setScale(event.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onConfirmButtonTap();
    };

    const reset = () => {
        setEmail('');
        setRole(DEFAULT_ROLE);
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setLanguage(DEFAULT_LANGUAGE_CODE);
        setScale(DEFAULT_SCALE);
        setCountry(DEFAULT_COUNTRY);
    };

    const deleteUserFunc = () => {
        deleteUser({uid: user?.uid, checkFlag: deleteCheckFlag});
    };

    const passwordFields = (
        <div className="flex w-full min-w-64 flex-row items-end justify-between gap-x-10">
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900">
                        {t('field-password')}
                    </label>
                </div>
                <div className="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        onChange={handlePasswordChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>
            <div className="flex-1">
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    {t('field-confirm-password')}
                </label>
                <div className="mt-2">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        onChange={handleConfirmPasswordChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label
                    htmlFor="firstName"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    {t('field-first-name')}
                </label>
                <div className="mt-2">
                    <input
                        value={firstName}
                        id="firstName"
                        name="firstName"
                        type="name"
                        required
                        onChange={handleFirstNameChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>
            <div>
                <label
                    htmlFor="lastName"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    {t('field-first-name')}
                </label>
                <div className="mt-2">
                    <input
                        value={firstName}
                        id="lastName"
                        name="lastName"
                        type="name"
                        required
                        onChange={handleLastNameChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    {t('field-email')}
                </label>
                <div className="mt-2">
                    <input
                        value={email}
                        id="email"
                        name="email"
                        type="email"
                        required
                        readOnly={mode == 'confirm'}
                        onChange={handleEmailChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>
            <div>
                {mode != 'confirm' && (
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium leading-6 text-gray-900">
                            {t('field-role')}
                        </label>
                        <div className="mt-2">
                            <select
                                value={currentRole}
                                onChange={handleRoleChange}
                                id="role"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                {roles.map(role => {
                                    return (
                                        <option key={role} value={role}>
                                            {t(`role-${role}`)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )}
                <label
                    htmlFor="language"
                    className="mt-2 block text-sm font-medium leading-6 text-gray-900">
                    {t('field-language')}
                </label>
                <div className="mt-2">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        id="country"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        {languages.map(language => {
                            return (
                                <option key={language} value={language}>
                                    {t(`language_${language}`)}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <label
                    htmlFor="country"
                    className="mt-2 block text-sm font-medium leading-6 text-gray-900">
                    {t('field-country')}
                </label>
                <div className="mt-2">
                    <select
                        value={country}
                        onChange={handleCountryChange}
                        id="country"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        {countriesCodes.map(country => {
                            return (
                                <option key={country} value={country}>
                                    {t(`country_${country}`)}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <label
                    htmlFor="scale"
                    className="mt-2 block text-sm font-medium leading-6 text-gray-900">
                    {t('field-scale')}
                </label>
                <div className="mt-2">
                    <select
                        value={scale}
                        onChange={handleScaleChange}
                        id="country"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        {scales.map(scale => {
                            return (
                                <option key={scale} value={scale}>
                                    {t(`scale_${scale}`)}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            {(mode == 'add' || mode == 'confirm') && passwordFields}

            <div className="flex w-full place-content-center justify-center pt-5">
                <button
                    type="submit"
                    className="flex w-1/4 min-w-48 max-w-64 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    {t("save")}
                </button>
            </div>
            {mode == 'add' && (
                <div className="flex w-full place-content-center justify-center">
                    <button
                        onClick={reset}
                        type="reset"
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
                        <div className='text-black'>{t('update-password')}</div>
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

                            <div className="flex w-full place-content-center justify-center pt-4">
                                <button
                                    onClick={updatePassword}
                                    type="button"
                                    className="flex w-1/4 min-w-48 max-w-64 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    {t('save')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {mode == 'edit' && (
                <div className="flex w-full place-content-center justify-center">
                    <button
                        onClick={deleteUserFunc}
                        type="button"
                        className="flex w-1/4 min-w-48 max-w-64 justify-center rounded-md bg-red-300 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                        {t('delete')}
                    </button>
                </div>
            )}
        </form>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    (state, dispatch, ownProps) => {
        return {...state, ...ownProps};
    },
)(UserForm);
