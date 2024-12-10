import React, {useContext, useEffect, useMemo} from 'react';
import {useFormik} from 'formik';
import Input from '../../Form/Input';
import {useActions} from '@/src/hooks/useEntity';
import {
    IRecipeEntity,
    MachineType,
    RecipeProcessType,
    RecipeStageType,
    TCategoryEntities,
} from '@/src/entities/EntityTypes';
import Select from '../../Form/Select';
import Textarea from '../../Form/Textarea';
import {useTranslation} from 'react-i18next';
import PresetFormulaItem from './PresetFormulaItem';
import UploadImages from '../../Form/UploadImages';
import {validatePresetForm} from './ValidateForm';
import PresentationPreset from './PresentationPreset';
import {getStorage, ref, deleteObject, getMetadata} from 'firebase/storage';
import ImageStore from '../../Form/ImageStore';
import {useDispatch} from 'react-redux';
import {setFlagger} from '@/store/types/actionTypes';
import {Modals} from '@/src/constants';
import ContainerContext from '@/src/ContainerContext';
import StageList from './StageList';
import ConfirmationDialog from '../../ConfirmationDialog';
import Multiselect from '../../Form/Multiselect';
import {ButtonSubmitting} from '../../Form/ButtonSubmitting';

interface iPresetFormProps {
    preset?: IRecipeEntity;
    categories?: TCategoryEntities;
}

export default function PresetForm(props: iPresetFormProps) {
    const {savePreset, deleteFile} = useActions('RecipeEntity');
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const valuesCategories =
        props.categories && Object.values(props.categories);
    const formik = useFormik({
        initialValues: {
            ...props.preset,
            recipe_process:
                props.preset?.recipe_process ?? RecipeProcessType.Preset,
            base_thickness: props.preset?.base_thickness ?? 5,
            stages: props.preset?.stages
                ? props.preset?.stages
                : [
                    {
                        initTemperature: 0,
                        fanPerformance1: 0,
                        fanPerformance2: 0,
                        duration: 0,
                    },
                ],
            temperature: props.preset?.temperature || {
                adjustment: 0,
                marinated: 0,
                thickness: 0,
            },
            time: props.preset?.time
                ? {
                    adjustment: props.preset?.time.adjustment,
                    marinated: props.preset?.time.marinated,
                    thickness: props.preset?.time.thickness,
                }
                : {
                    adjustment: 0,
                    marinated: 0,
                    thickness: 0,
                },
            machine_type: props.preset?.machine_type ?? MachineType.Dehydrator,
            categories: props.preset?.categories?.map(c => {
                const cat = valuesCategories.find(cat => cat?.id === c);
                return {
                    label: cat?.category_name,
                    value: cat?.id,
                };
            }),
            type_session: RecipeStageType.Time
        },
        validate: (values: IRecipeEntity) => validatePresetForm(values, t),
        onSubmit: async (values, {setFieldValue}) => {
            savePreset(values);
            setFieldValue('media_resources_buffer', []);
        },
    });

    const handleRemoveInput = (index, inputName) => {
        formik.setFieldValue(
            inputName,
            formik.values[inputName].filter((_, i) => i !== index),
        );
    };

    useEffect(() => {
        formik.setFieldValue('media_resources', props.preset?.media_resources);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.preset?.media_resources]);

    const handleChange = event => formik.handleChange(event);

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
        dispatch(setFlagger(Modals.DeleteFileDialog, name));
    };
    const handleDelBufferImage = (index: number) => {
        const updatedMediaResources =
            formik.values.media_resources_buffer.filter((_, i) => i !== index);
        formik.setFieldValue('media_resources_buffer', updatedMediaResources);
    };
    const di = useContext(ContainerContext);
    const ToastEmitter = di.resolve('ToastEmitter');
    const handleDelImageModal = async (name: string) => {
        const storage = getStorage();
        const desertRef = ref(storage, `recipes/${name}`);
        getMetadata(desertRef)
            .then(() => {
                deleteObject(desertRef)
                    .then(() => {
                        deleteFile({id: props?.preset?.id, name});
                        formik.setFieldValue(
                            'media_resources',
                            formik.values['media_resources'].filter(
                                nameFile => nameFile !== name,
                            ),
                        );
                    })
                    .catch(err => {
                        ToastEmitter.errorMessage(err);
                    });
            })
            .catch(() => {
                deleteFile({id: props?.preset?.id, name});
                formik.setFieldValue(
                    'media_resources',
                    formik.values['media_resources'].filter(
                        nameFile => nameFile !== name,
                    ),
                );
            });
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
                },
            ]);
        } else {
            formik.setFieldValue('stages', [
                {
                    fanPerformance1: 0,
                    fanPerformance2: 0,
                    duration: 0,
                    initTemperature: 0,
                },
            ]);
        }
    };

    const categoriesLevels = useMemo(() => {
        if (!valuesCategories || valuesCategories?.length === 0) {
            return [];
        }
        const getChildCategories = parentId => {
            return valuesCategories.filter(c => c.parent_id === parentId);
        };

        const catLvl1 = valuesCategories.filter(c => !c.parent_id);

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
    }, [valuesCategories]);
    return (
        <>
            {/* <DeleteFileModal onDeleteFile={handleDelImageModal} /> */}
            <ConfirmationDialog
                onOkAction={(name: string) => {
                    handleDelImageModal(name);
                }}
                title={t('delete-image')}
                flagerKey={Modals.DeleteImage}
            />
            <form onSubmit={formik.handleSubmit} className="text-gray-800">
                <div className="w-full">
                    <div className="mt-6 grid grid-cols-2 gap-x-4">
                        <Input
                            name="recipe_name"
                            value={formik.values.recipe_name}
                            onChange={handleChange}
                            required={true}
                            error={formik.errors.recipe_name as string}
                            label={t('preset-name')}
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
                        classNameContainer={'mt-4'}
                        value={formik.values.description}
                        onChange={handleChange}
                        label={t('description')}
                        rows={5}
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
                    <div className="mt-6">
                        <Input
                            name={`base_thickness`}
                            value={formik.values.base_thickness}
                            onChange={handleChange}
                            required={true}
                            label={t('base-thickness')}
                            type="number"
                            error={formik.errors.base_thickness as string}
                            min={0}
                            readOnly={true}
                        />
                        <Input
                            classNameContainer="mt-4"
                            name={`moisture`}
                            value={formik.values.moisture}
                            onChange={handleChange}
                            required={true}
                            label={t('moisture')}
                            type="number"
                            error={formik.errors.moisture as string}
                            min={0}
                        />
                        {/* <div className="mt-6">
                            <Stage
                                data={formik?.values?.stages}
                                inputName="stages"
                                addBtnText={t('add-new-stage')}
                                handleChange={handleChange}
                                handleRemove={handleRemoveInput}
                                errors={formik?.errors?.base_thickness}
                            />
                        </div> */}

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
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-x-4">
                        {/* <div>
                            <PresetFormulaItem
                                data={formik?.values}
                                inputName="thickness"
                                title={t('thickness')}
                                handleChange={handleChange}
                                errors={formik?.errors}
                            />
                        </div> */}
                        <div>
                            <PresetFormulaItem
                                data={formik?.values}
                                inputName="adjustment"
                                title={t('adjustment')}
                                handleChange={handleChange}
                                errors={formik?.errors}
                                tooltipTextTemperature={t(
                                    'tooltipTextTemperature1',
                                )}
                                tooltipTextTime={t('tooltipTextTime1')}
                            />
                        </div>
                        <div>
                            <PresetFormulaItem
                                data={formik?.values}
                                inputName="marinated"
                                title={t('marinated')}
                                handleChange={handleChange}
                                errors={formik?.errors}
                                tooltipTextTemperature={t(
                                    'tooltipTextTemperature2',
                                )}
                                tooltipTextTime={t('tooltipTextTime2')}
                            />
                        </div>
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
                                        folder={`recipes/${props?.preset?.id}`}
                                        name={image}
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
                        <div className="w-64 text-sm">
                            <ButtonSubmitting
                                actionType="ADD"
                                entityName="recipes"
                                translationLabel="save"
                            />
                        </div>
                    </div>
                </div>
            </form>
            <PresentationPreset values={formik.values} />
        </>
    );
}
