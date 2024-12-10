import { Modals } from "@/src/constants";
import { IMachineEntity, MachineType, Zone } from "@/src/entities/EntityTypes";
import { useActions } from "@/src/hooks/useEntity";
import { setFlagger } from "@/store/types/actionTypes";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ConfirmationDialog from "../../ConfirmationDialog";
import { ButtonSubmitting } from "../../Form/ButtonSubmitting";
import ImageStore from "../../Form/ImageStore";
import Input from "../../Form/Input";
import Multiselect from "../../Form/Multiselect";
import Select from "../../Form/Select";
import UploadImage from "../../Form/UploadImage";

interface IMachineModelFormProps {
    machineModel?:IMachineEntity
}

export default function MachinesModelForm(props: IMachineModelFormProps) {
    const dispatch = useDispatch()
    const {saveMachineModel, deleteFile} = useActions('MachineModelEntity');
    const {t} = useTranslation();
    const formik = useFormik({
        initialValues: {
            ...props?.machineModel,
            mediaResources: props?.machineModel?.mediaResources ?? "",
            machineType: props.machineModel?.machineType ?? MachineType.Dehydrator,
            zones: props?.machineModel?.zones.map(item => {
                return {
                    label: item.toUpperCase(),
                    value: item,
                }
            })
        },
        validate: (values: IMachineEntity) => {
            const errors: Partial<IMachineEntity> = {};
            if (!values.model) {
                errors.model = t('required');
            }
            if (!values.brand) {
                errors.brand = t('required');
            }
            if (!values.zones || values?.zones?.length === 0) {
                errors.zones = [t('required')];
            }
            return errors;
        },
        onSubmit: (values, {setFieldValue}) => {
            saveMachineModel({
                ...values,
                zones: values?.zones?.map(item => {
                    return item.value
                })
            });
            // setFieldValue('mediaResourcesBuffer', []);
        },
    })
    const handleChange = event => formik.handleChange(event);
    
    const zoneNames = useMemo(() => {
        return Object.values(Zone).map(zone => ({
            value: zone.toLowerCase(),
            label: zone,
        }));
    }, [])

    useEffect(() => {
        formik.setFieldValue('media_resources', props.machineModel?.mediaResources);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.machineModel?.mediaResources]);

    const handleAddImage = (data:any) => {
        formik.setFieldValue('mediaResourcesBuffer', data);
    }
    const handleDelImage = (name: string) => {
        deleteFile({id: props?.machineModel?.id, name});
        formik.setFieldValue(
            'mediaResources',
            null
        );
    }
    const handleDelBufferImage = (index: number) => {
        const updatedMediaResources =
        formik.values.mediaResourcesBuffer = "";
        formik.setFieldValue('mediaResourcesBuffer', updatedMediaResources);
    }

    return (
        <>
            <ConfirmationDialog
                onOkAction={(name: string) => {
                    handleDelImage(name);
                }}
                title={t('delete-image')}
                flagerKey={Modals.DeleteImage}
            />
            <form onSubmit={formik.handleSubmit} className='text-gray-900'>
                <div className="w-full flex flex-col gap-3">
                    <Input
                        name="model"
                        value={formik.values?.model}
                        onChange={handleChange}
                        placeholder={t('model-name')}
                        required={true}
                        error={formik.errors?.model}
                        label={t('model-name')}
                    />
                    <Multiselect
                        name="zones"
                        options={zoneNames}
                        value={formik.values.zones}
                        onChange={value => {
                            formik.setFieldValue('zones', value);
                        }}
                        required={true}
                        error={formik.errors.zones}
                        label={t('zones-name')}
                    />
                    <Input
                        name="brand"
                        value={formik.values?.brand}
                        onChange={handleChange}
                        placeholder={t('brand-name')}
                        required={true}
                        error={formik.errors?.brand}
                        label={t('brand-name')}
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
                        value={formik.values.machineType}
                        onChange={handleChange}
                        required={true}
                        error={formik.errors.machineType as string}
                        label={t('machine-type')}
                    />
                    {!formik.values.mediaResources ? 
                        <div className="mt-2">
                            <UploadImage
                                nameDialog={`${Modals.CropDialog}`}
                                handleAddImage={handleAddImage}
                                handleDelImage={handleDelBufferImage}
                                image={formik.values.mediaResourcesBuffer}
                            />
                        </div> 
                        : 
                        <div className="mt-2 grid grid-cols-6 gap-x-2">
                            {formik.values.mediaResources &&
                            <ImageStore
                                key={`${formik.values.mediaResources}`}
                                folder={`models/${props?.machineModel?.id}`}
                                name={`${formik.values.mediaResources}`}
                                handleDelImage={() => {
                                    dispatch(
                                        setFlagger(
                                            Modals.DeleteImage,
                                            formik.values.mediaResources,
                                        ),
                                    );
                                }}
                            />}
                        </div>
                    }
                    <div className="flex w-full place-content-center justify-center py-2">
                        <div className="text-sm w-64">
                            <ButtonSubmitting actionType='ADD' entityName='machines-models' translationLabel='save'/>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}