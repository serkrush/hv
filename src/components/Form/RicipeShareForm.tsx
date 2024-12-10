import {IInvitation} from '@/server/models/Invitation';
import ContainerContext from '@/src/ContainerContext';
import {Modals} from '@/src/constants';
import {IUserEntity, TCategoryEntities} from '@/src/entities/EntityTypes';
import {useActions} from '@/src/hooks/useEntity';
import {useFormik} from 'formik';
import {useContext, useMemo} from 'react';
import ConfirmationDialog from '../ConfirmationDialog';
import {ButtonSubmitting} from './ButtonSubmitting';
import Input from './Input';
import * as actionTypes from '@/store/types/actionTypes';
import Multiselect from './Multiselect';
import {v4} from 'uuid';

interface iRicipeShareFormProps {
    user?: IUserEntity | undefined;
    invitation?: IInvitation | undefined;
    deleteCheckFlag?: string;
    categories?: TCategoryEntities;
}

export default function RicipeShareForm({
    user = undefined as IUserEntity | undefined,
    invitation = undefined as IInvitation | undefined,
    deleteCheckFlag = 'DELETE_USER',
    categories,
}: iRicipeShareFormProps) {
    const di = useContext(ContainerContext);
    const t = di.resolve('t');

    const validate = values => {
        const errors: any = {};
        if (values && values.length > 0) {
            const arrErrors: any[] = values.map((data, index) => {
                const error = {} as any;
                if (!data.recipe_name) {
                    error.recipe_name = t('required');
                }
                return error;
            });
            const hasstageErrors = arrErrors.some(
                stageErrors => Object.keys(stageErrors).length > 0,
            );
            if (hasstageErrors) {
                errors.data = arrErrors;
            }
        }

        return errors;
    };

    const {delete: deleteUser} = useActions('UserEntity');

    const {shareConfirm} = useActions('RecipeEntity');

    const onConfirmButtonTap = values => {
        console.log('onConfirmButtonTap values', values)
        shareConfirm({
            invitationId: invitation?.id,
            recipes: values,
            userId: user.uid,
        });
    };

    const values = categories && Object.values(categories);
    const categoriesOptions = useMemo(() => {
        if (values) {
            return values
                .filter(item => item.user_id !== null)
                .map(item => ({
                    label: item.category_name,
                    value: item.id,
                }));
        }
    }, [values]);

    const formik = useFormik({
        initialValues: invitation.accessData.map(data => ({
            ...data,
            id: v4(),
            folder: data.id,
            categories: categoriesOptions?.length > 0 ? [categoriesOptions[0]] : undefined,
        })),
        validate,
        onSubmit: onConfirmButtonTap,
    });
    const handleChange = event => {
        formik.setErrors({});
        formik.handleChange(event);
    };

    return (
        <form onSubmit={formik.handleSubmit} className="w-full">
            <ConfirmationDialog
                onOkAction={data => {
                    deleteUser(data);
                }}
                title={t('delete-user')}
                flagerKey={Modals.DeleteUser}
            />
            <div className="w-full"></div>
            <div>
                {formik.values?.length > 0 &&
                    formik.values.map((data, index) => {
                        return (
                            <div key={`${index}-recipe`}>
                                <Input
                                    name={`[${index}].recipe_name`}
                                    value={data?.recipe_name}
                                    onChange={handleChange}
                                    required={true}
                                    label={t('recipe-name')}
                                    error={
                                        formik.errors.data &&
                                        (formik.errors.data[index]
                                            .recipe_name as string)
                                    }
                                />
                                <Multiselect
                                    // name="categories"
                                    name={`[${index}].categories`}
                                    options={categoriesOptions}
                                    value={data.categories}
                                    onChange={value => {
                                        formik.setFieldValue(
                                            `[${index}].categories`,
                                            value,
                                        );
                                    }}
                                    label={t('categories')}
                                />
                            </div>
                        );
                    })}
            </div>
            <div className="flex w-full place-content-center justify-center pt-5">
                <div className="flex w-1/4 min-w-48 max-w-64 text-sm">
                    <ButtonSubmitting
                        actionType={actionTypes.ADD}
                        entityName={'recipes'}
                        translationLabel={'save'}
                    />
                </div>
            </div>
        </form>
    );
}
