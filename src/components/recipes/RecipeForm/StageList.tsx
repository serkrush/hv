import React from 'react';
import Input from '../../Form/Input';
import {TrashIcon} from '@heroicons/react/24/outline';
import {IStageEntity, RecipeStageType} from '@/src/entities/EntityTypes';
import {useTranslation} from 'react-i18next';

interface StageListProps {
    typeSession: RecipeStageType;
    data: IStageEntity[];
    inputName: string;
    title: string;
    addBtnText: string;
    handleChange: (event: any) => void;
    handleRemove: (index: number, inputName: string) => void;
    handleAdd: () => void;
    errors?: any;
}

export default function StageList({
    typeSession,
    data,
    inputName,
    title,
    addBtnText,
    handleChange,
    handleRemove,
    handleAdd,
    errors,
}: StageListProps) {
    const {t} = useTranslation();
    return (
        <>
            <p>{title}</p>
            {data?.length > 0 &&
                data.map((stage, index) => {
                    return (
                        <div key={`${index}-stage`}>
                            <div
                                key={`${index}`}
                                className="mt-3 grid grid-cols-6 items-center gap-x-4">
                                <Input
                                    name={`${inputName}[${index}].fanPerformance1`}
                                    value={stage?.fanPerformance1}
                                    onChange={handleChange}
                                    required={true}
                                    label={t('fan-speed', {number: 1})}
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.fanPerformance1
                                    }
                                />
                                <Input
                                    name={`${inputName}[${index}].fanPerformance2`}
                                    value={stage?.fanPerformance2}
                                    onChange={handleChange}
                                    label={t('fan-speed', {number: 2})}
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.fanPerformance2
                                    }
                                />
                                <Input
                                    name={`${inputName}[${index}].initTemperature`}
                                    value={stage?.initTemperature}
                                    onChange={handleChange}
                                    required={true}
                                    label={t('temperature')}
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.initTemperature
                                    }
                                />
                                <Input
                                    name={`${inputName}[${index}].duration`}
                                    value={stage?.duration}
                                    onChange={handleChange}
                                    required={true}
                                    label={t('stage-time')}
                                    hidden={
                                        typeSession ===
                                            RecipeStageType.Weight &&
                                        data.length === index + 1
                                    }
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.duration
                                    }
                                />
                                <Input
                                    name={`${inputName}[${index}].weight`}
                                    value={stage?.weight}
                                    onChange={handleChange}
                                    required={true}
                                    label={t('weight-loss')}
                                    hidden={
                                        typeSession === RecipeStageType.Time ||
                                        index !== data.length - 1
                                    }
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.weight
                                    }
                                />
                                <Input
                                    name={`${inputName}[${index}].heatingIntensity`}
                                    value={stage?.heatingIntensity}
                                    onChange={handleChange}
                                    label={t('intensity')}
                                    type="number"
                                    error={
                                        errors &&
                                        errors.length > 0 &&
                                        errors[index]?.heatingIntensity
                                    }
                                />
                                <button
                                    className="inline-flex w-max"
                                    onClick={() =>
                                        handleRemove(index, inputName)
                                    }
                                    type="button">
                                    <TrashIcon
                                        className="h-6 w-6 shrink-0 text-gray-600"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>
                    );
                })}
            <button
                onClick={handleAdd}
                type="button"
                className="mt-2 flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                {addBtnText}
            </button>
        </>
    );
}
