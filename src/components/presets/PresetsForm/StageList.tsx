import React from 'react';
import Input from '../../Form/Input';
import {TrashIcon} from '@heroicons/react/24/outline';
import {IStageEntity} from '@/src/entities/EntityTypes';
import {useTranslation} from 'react-i18next';

interface StageListProps {
    data: IStageEntity[];
    inputName: string;
    title: string;
    addBtnText: string;
    handleChange: (event: any) => void;
    handleRemove: (index: number, inputName: string) => void;
    handleAdd: () => void;
    errors?: any;
}

export default function StageList(props: StageListProps) {
    const {t} = useTranslation();
    return (
        <>
            <p>{props.title}</p>
            {props.data?.length > 0 &&
                props.data.map((stage, index) => {
                    return (
                        <div key={`${index}-stage`}>
                            <div
                                key={`${index}`}
                                className="mt-3 grid grid-cols-6 items-center gap-x-4">
                                <Input
                                    name={`${props.inputName}[${index}].fanPerformance1`}
                                    value={stage?.fanPerformance1}
                                    onChange={props.handleChange}
                                    required={true}
                                    label={t('fan-speed', {number: 1})}
                                    type="number"
                                    error={
                                        props.errors &&
                                        props.errors.length > 0 &&
                                        props.errors[index]?.fanPerformance1
                                    }
                                />
                                <Input
                                    name={`${props.inputName}[${index}].fanPerformance2`}
                                    value={stage?.fanPerformance2}
                                    onChange={props.handleChange}
                                    required={true}
                                    label={t('fan-speed', {number: 2})}
                                    type="number"
                                    error={
                                        props.errors &&
                                        props.errors.length > 0 &&
                                        props.errors[index]?.fanPerformance2
                                    }
                                />
                                <Input
                                    name={`${props.inputName}[${index}].initTemperature`}
                                    value={stage?.initTemperature}
                                    onChange={props.handleChange}
                                    required={true}
                                    label={t('temperature')}
                                    type="number"
                                    error={
                                        props.errors &&
                                        props.errors.length > 0 &&
                                        props.errors[index]?.initTemperature
                                    }
                                />
                                <Input
                                    name={`${props.inputName}[${index}].duration`}
                                    value={stage?.duration}
                                    onChange={props.handleChange}
                                    required={true}
                                    label={t('stage-time')}
                                    type="number"
                                    error={
                                        props.errors &&
                                        props.errors.length > 0 &&
                                        props.errors[index]?.duration
                                    }
                                />
                                <Input
                                    name={`${props.inputName}[${index}].heatingIntensity`}
                                    value={stage?.heatingIntensity}
                                    onChange={props.handleChange}
                                    required={true}
                                    label={t('intensity')}
                                    type="number"
                                    error={
                                        props.errors &&
                                        props.errors.length > 0 &&
                                        props.errors[index]?.heatingIntensity
                                    }
                                />
                                <button
                                    className="inline-flex w-max"
                                    onClick={() =>
                                        props.handleRemove(
                                            index,
                                            props.inputName,
                                        )
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
                onClick={props.handleAdd}
                type="button"
                className="mt-2 flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                {props.addBtnText}
            </button>
        </>
    );
}
