import {IUser} from '@/server/models/User';
import ContainerContext from '@/src/ContainerContext';
import {useActions} from '@/src/hooks/useEntity';
import {useContext} from 'react';
import {ButtonSubmitting} from './Form/ButtonSubmitting';

export default function UserCard({
    user,
    deleteCheckFlag = 'DELETE_USER',
}: {
    user: IUser;
    deleteCheckFlag;
}) {
    const di = useContext(ContainerContext);
    const t = di.resolve('t');

    const {delete: deleteUser} = useActions('UserEntity');

    const deleteUserFunc = () => {
        deleteUser({uid: user?.uid, checkFlag: deleteCheckFlag});
    };

    const row = ({field, value}) => {
        return (
            <div
                key={field}
                className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{field}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {value}
                </dd>
            </div>
        );
    };

    return (
        <div>
            <div className="w-full max-w-2xl overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200">
                    <dl>
                        {row({
                            field: t('field-first-name'),
                            value: user.firstName,
                        })}
                        {row({
                            field: t('field-last-name'),
                            value: user.lastName,
                        })}
                        {row({field: t('field-email'), value: user.email})}
                        {row({
                            field: t('field-role'),
                            value: t(`role-${user.role}`),
                        })}
                    </dl>
                </div>
            </div>
            <div className="flex w-full place-content-center justify-center py-6">
                <div className="w-64 text-sm">
                    <ButtonSubmitting
                        actionType={'DELETE'}
                        colorClassNames="bg-red-300 disabled:hover:bg-red-300 hover:bg-red-200 focus-visible:outline-red-400"
                        onClick={deleteUserFunc}
                        type="button"
                        entityName={'users'}
                        translationLabel={'delete'}
                    />
                </div>
            </div>
        </div>
    );
}
