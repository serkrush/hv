import React, {useEffect, useMemo} from 'react';
import {useFormik} from 'formik';
import Input from '../../Form/Input';
import {useActions} from '@/src/hooks/useEntity';
import {
    TCategoryEntities,
    IIngredientEntity,
    IRecipeEntity,
    IStageEntity,
    IngridientActionType,
    MachineType,
    RecipeStageType,
    RecipeProcessType,
} from '@/src/entities/EntityTypes';
import Select from '../../Form/Select';
import Multiselect from '../../Form/Multiselect';
import Textarea from '../../Form/Textarea';
import StageList from './StageList';
import IngridientList from './IngridientList';
import {useTranslation} from 'react-i18next';
import ImageStore from '../../Form/ImageStore';
import UploadImages from '../../Form/UploadImages';
import ConfirmationDialog from '../../ConfirmationDialog';
import {Modals} from '@/src/constants';
import {setFlagger} from '@/store/types/actionTypes';
import {useDispatch} from 'react-redux';
import InputRadio from '../../Form/InputRadio';
import { ButtonSubmitting } from '../../Form/ButtonSubmitting';

interface iRecipeFormProps {
    recipe?: IRecipeEntity;
    categories?: TCategoryEntities;
}

export default function RecipeForm(props: iRecipeFormProps) {
    const dispatch = useDispatch();
    const {saveRecipe, deleteFile, deleteMethodFile, deleteIngredientImages} =
        useActions('RecipeEntity');
    const {t} = useTranslation();
    const values = props.categories && Object.values(props.categories);
    const formik = useFormik({
        initialValues: {
            ...props.recipe,
            recipe_process:
                props.recipe?.recipe_process ?? RecipeProcessType.Recipe,
            media_resources: props.recipe?.media_resources ?? [],
            type_session: props.recipe?.type_session || RecipeStageType.Time,
            stages: props.recipe?.stages || [
                {
                    initTemperature: 0,
                    fanPerformance1: 0,
                    fanPerformance2: 0,
                    duration: 0,
                    weight: 0,
                    heatingIntensity: 0,
                },
            ],
            machine_type: props.recipe?.machine_type ?? MachineType.Dehydrator,
            categories: props.recipe?.categories?.map(c => {
                const cat = values.find(cat => cat?.id === c);
                return {
                    label: cat?.category_name,
                    value: cat?.id,
                };
            }),
        },
        validate: (values: IRecipeEntity) => {
            const errors: Partial<IRecipeEntity> = {};
            if (!values.recipe_name) {
                errors.recipe_name = t('required');
            }
            if (!values.machine_type) {
                errors.machine_type = t('required');
            }

            if (
                values.recipe_ingredients &&
                values.recipe_ingredients.length > 0
            ) {
                const ingridientsErrors: any[] = values.recipe_ingredients.map(
                    (ingridient, index) => {
                        const ingridientErrors: Partial<IIngredientEntity> = {};
                        if (!ingridient.description) {
                            ingridientErrors.description = t('required');
                        }
                        return ingridientErrors;
                    },
                );
                const hasIngridientErrors = ingridientsErrors.some(
                    ingridientErrors =>
                        Object.keys(ingridientErrors).length > 0,
                );
                if (hasIngridientErrors) {
                    errors.recipe_ingredients = ingridientsErrors;
                }
            }

            if (values.stages && values.stages.length > 0) {
                const stagesErrors: any[] = values.stages.map(
                    (stage: IStageEntity, index) => {
                        const stageErrors = {} as any;
                        if (!stage.fanPerformance1) {
                            stageErrors.fanPerformance1 = t('required');
                        }
                        if (!stage.initTemperature) {
                            stageErrors.initTemperature = t('required');
                        }
                        if (
                            (values.type_session === RecipeStageType.Time ||
                                (values.type_session ===
                                    RecipeStageType.Weight &&
                                    values.stages.length !== index + 1)) &&
                            stage?.duration <= 0
                        ) {
                            stageErrors.duration = t('should-be');
                        }
                        if (
                            values.type_session === RecipeStageType.Weight &&
                            stage?.weight <= 0 &&
                            values.stages.length === index + 1
                        ) {
                            stageErrors.weight = t('should-be');
                        }
                        return stageErrors;
                    },
                );
                const hasstageErrors = stagesErrors.some(
                    stageErrors => Object.keys(stageErrors).length > 0,
                );
                if (hasstageErrors) {
                    errors.stages = stagesErrors;
                }
            }
            if (!values.categories || values?.categories?.length === 0) {
                errors.categories = [t('required')];
            }
            return errors;
        },
        onSubmit: (values, {setFieldValue}) => {
            saveRecipe(values);
            setFieldValue('media_resources_buffer', []);
        },
    });

    useEffect(() => {
        formik.setFieldValue('media_resources', props.recipe?.media_resources);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.recipe?.media_resources]);

    useEffect(() => {
        formik.setFieldValue(
            'recipe_ingredients',
            props.recipe?.recipe_ingredients,
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.recipe?.recipe_ingredients]);

    const categoriesLevels = useMemo(() => {
        if (!values || values?.length === 0) {
            return [];
        }
        const getChildCategories = parentId => {
            return values.filter(c => c.parent_id === parentId);
        };

        const catLvl1 = values.filter(c => !c.parent_id);

        const catLvl1And2And3 = catLvl1
            .map(c1 => {
                const catLvl2 = getChildCategories(c1.id);
                const catLvl2And3 = catLvl2
                    .map(c2 => {
                        const catLvl3 = getChildCategories(c2.id);
                        if (catLvl3.length > 0) {
                            return {
                                label: `${c1.category_name} / ${c2.category_name}`,
                                options: catLvl3.map(c => ({
                                    label: c.category_name,
                                    value: c.id,
                                })),
                            };
                        } else {
                            return null;
                        }
                    })
                    .filter(Boolean);
                return catLvl2And3;
            })
            .flat();

        return catLvl1And2And3;
    }, [values]);

    const handleRemoveInput = (index, inputName) => {
        formik.setFieldValue(
            inputName,
            formik.values[inputName].filter((_, i) => i !== index),
        );
    };

    const handleAddIngredient = action => {
        if (
            formik?.values?.recipe_ingredients &&
            Array.isArray(formik.values.recipe_ingredients)
        ) {
            formik.setFieldValue('recipe_ingredients', [
                ...formik.values.recipe_ingredients,
                {description: '', action: action},
            ]);
        } else {
            formik.setFieldValue('recipe_ingredients', [
                {description: '', action: action},
            ]);
        }
    };

    const handleAddStage = () => {
        if (formik?.values?.stages && Array.isArray(formik.values.stages)) {
            formik.setFieldValue('stages', [
                ...formik.values.stages,
                {
                    fanPerformance1: 0,
                    fanPerformance2: 0,
                    duration: 0,
                    initTemperature: 0,
                    weight: 0,
                    heatingIntensity: 0,
                },
            ]);
        } else {
            formik.setFieldValue('stages', [
                {
                    fanPerformance1: 0,
                    fanPerformance2: 0,
                    duration: 0,
                    initTemperature: 0,
                    weight: 0,
                    heatingIntensity: 0,
                },
            ]);
        }
    };

    const handleChange = event => formik.handleChange(event);
    const ingredientsTypes = useMemo(() => {
        if (!formik?.values?.recipe_ingredients) {
            return {
                [IngridientActionType.Ingredient]: [],
                [IngridientActionType.Method]: [],
            };
        }
        const result = formik?.values?.recipe_ingredients?.reduce(
            (acc, curr, index) => {
                if (!acc[curr.action]) {
                    acc[curr.action] = [];
                }
                acc[curr.action].push({...curr, index});
                return acc;
            },
            {},
        );
        return result;
    }, [formik?.values?.recipe_ingredients]);

    const handleAddImage = data => {
        if (
            formik?.values?.media_resources_buffer &&
            Array.isArray(formik.values.media_resources_buffer)
        ) {
            formik.setFieldValue('media_resources_buffer', [
                ...formik.values.media_resources_buffer,
                data,
            ]);
        } else {
            formik.setFieldValue('media_resources_buffer', [data]);
        }
    };
    const handleDelImage = (name: string) => {
        deleteFile({id: props?.recipe?.id, name});
        formik.setFieldValue(
            'media_resources',
            formik.values['media_resources'].filter(
                nameFile => nameFile !== name,
            ),
        );
    };
    const handleDelBufferImage = (index: number) => {
        const updatedMediaResources =
            formik.values.media_resources_buffer.filter((_, i) => i !== index);
        formik.setFieldValue('media_resources_buffer', updatedMediaResources);
    };

    const handleMethodAddImage = (data, index) => {
        if (
            formik?.values?.recipe_ingredients &&
            Array.isArray(formik.values.recipe_ingredients)
        ) {
            const updatedIngredients = formik.values.recipe_ingredients.map(
                (ingredient, i) => {
                    if (i === index) {
                        return {
                            ...ingredient,
                            media_resource_buffer: data,
                        };
                    }
                    return ingredient;
                },
            );

            formik.setFieldValue('recipe_ingredients', updatedIngredients);
        } else {
            formik.setFieldValue('recipe_ingredients', [
                {media_resource_buffer: data},
            ]);
        }
    };
    const handleMethodDelImage = (name: string) => {
        deleteMethodFile({id: props?.recipe?.id, name});
        if (
            formik?.values?.recipe_ingredients &&
            Array.isArray(formik.values.recipe_ingredients)
        ) {
            const updatedIngredients = formik.values.recipe_ingredients.map(
                ingredient => {
                    if (ingredient.media_resource === name) {
                        const {media_resource, ...rest} = ingredient;
                        return rest;
                    }
                    return ingredient;
                },
            );

            formik.setFieldValue('recipe_ingredients', updatedIngredients);
        }
    };
    const handleMethodDelBufferImage = (index: number) => {
        const updatedIngredients = formik.values.recipe_ingredients.map(
            (ingredient, i) => {
                if (i === index) {
                    const {media_resource_buffer, ...rest} = ingredient;
                    return rest;
                }
                return ingredient;
            },
        );
        formik.setFieldValue('recipe_ingredients', updatedIngredients);
    };


    return (
        <>
            <ConfirmationDialog
                onOkAction={(name: string) => {
                    handleDelImage(name);
                }}
                title={t('delete-image')}
                flagerKey={Modals.DeleteImage}
            />
            <ConfirmationDialog
                onOkAction={(name: string) => {
                    handleMethodDelImage(name);
                }}
                title={t('delete-image')}
                flagerKey={Modals.DeleteMethodImage}
            />
            <form onSubmit={formik.handleSubmit} className='text-gray-900'>
                <div className="w-full">
                    <div className="mt-6 grid grid-cols-2 gap-x-4 ">
                        <Input
                            name="recipe_name"
                            value={formik.values.recipe_name}
                            onChange={handleChange}
                            required={true}
                            error={formik.errors.recipe_name as string}
                            label={t('recipe-name')}
                        />
                        <Select
                            name="machine_type"
                            data={[
                                {
                                    label: t(`${MachineType.Dehydrator}`),
                                    value: MachineType.Dehydrator,
                                },
                                {
                                    label: t(`${MachineType.FreezeDryer}`),
                                    value: MachineType.FreezeDryer,
                                },
                            ]}
                            value={formik.values.machine_type}
                            onChange={handleChange}
                            required={true}
                            error={formik.errors.machine_type as string}
                            label={t('machine-type')}
                        />
                    </div>
                    <Textarea
                        name="description"
                        value={formik.values.description}
                        onChange={handleChange}
                        label={t('description')}
                        rows={5}
                        classNameContainer={'mt-4'}
                    />
                    <Multiselect
                        name="categories"
                        options={categoriesLevels}
                        value={formik.values.categories}
                        onChange={value => {
                            formik.setFieldValue('categories', value);
                        }}
                        required={true}
                        error={formik.errors.categories}
                        label={t('categories')}
                    />

                    <div className="mt-6 grid grid-cols-2 gap-x-4">
                        <div>
                            <IngridientList
                                data={
                                    ingredientsTypes[
                                        IngridientActionType.Ingredient
                                    ]
                                }
                                inputName="recipe_ingredients"
                                title={t('ingredients')}
                                labelInput={t('ingredient-name')}
                                addBtnText={t('add-new-ingredient')}
                                handleChange={handleChange}
                                handleRemove={handleRemoveInput}
                                handleAdd={() =>
                                    handleAddIngredient(
                                        IngridientActionType.Ingredient,
                                    )
                                }
                                errors={formik?.errors?.recipe_ingredients}
                            />
                        </div>
                        <div>
                            <IngridientList
                                data={
                                    ingredientsTypes[
                                        IngridientActionType.Method
                                    ]
                                }
                                id={props?.recipe?.id}
                                inputName="recipe_ingredients"
                                title={t('method')}
                                labelInput={t('description')}
                                addBtnText={t('add-new-method')}
                                handleChange={handleChange}
                                handleRemove={handleRemoveInput}
                                handleAdd={() =>
                                    handleAddIngredient(
                                        IngridientActionType.Method,
                                    )
                                }
                                errors={formik?.errors?.recipe_ingredients}
                                handleAddImage={handleMethodAddImage}
                                handleDelBufferImage={
                                    handleMethodDelBufferImage
                                }
                                // handleDelImage={handleMethodDelImage}
                                deleteIngredientImages={file =>
                                    deleteIngredientImages({file})
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <InputRadio
                            valuesArray={[
                                {
                                    id: RecipeStageType.Time,
                                    title: RecipeStageType.Time,
                                },
                                {
                                    id: RecipeStageType.Weight,
                                    title: RecipeStageType.Weight,
                                },
                            ]}
                            name="type_session"
                            value={formik.values.type_session}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mt-6">
                        <StageList
                            data={formik?.values?.stages}
                            inputName="stages"
                            title={t('stages')}
                            addBtnText={t('add-new-stage')}
                            handleChange={handleChange}
                            handleRemove={handleRemoveInput}
                            handleAdd={handleAddStage}
                            errors={formik?.errors?.stages}
                            typeSession={formik.values.type_session}
                        />
                    </div>
                    <div className="mt-2">
                        <UploadImages
                            handleAddImage={handleAddImage}
                            handleDelImage={handleDelBufferImage}
                            images={formik.values.media_resources_buffer}
                        />
                    </div>
                    <div className="mt-2 grid grid-cols-6 gap-x-2">
                        {formik.values.media_resources &&
                            formik.values.media_resources.length > 0 &&
                            formik.values.media_resources.map(
                                (image, index) => (
                                    <ImageStore
                                        key={`${image}-${index}`}
                                        folder={`recipes/${props?.recipe?.id}`}
                                        name={`${image}`}
                                        handleDelImage={() => {
                                            dispatch(
                                                setFlagger(
                                                    Modals.DeleteImage,
                                                    image,
                                                ),
                                            );
                                        }}
                                    />
                                ),
                            )}
                    </div>
                    <div className="flex w-full place-content-center justify-center py-2">
                        <div className="text-sm w-64">
                            <ButtonSubmitting actionType='ADD' entityName='recipes' translationLabel='save'/>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
