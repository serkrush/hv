import React from 'react';
import Input from '../../Form/Input';
import {IStageEntity} from '@/src/entities/EntityTypes';
import {useTranslation} from 'react-i18next';

interface StageProps {
    data: IStageEntity[];
    inputName: string;
    addBtnText: string;
    handleChange: (event: any) => void;
    handleRemove: (index: number, inputName: string) => void;
    errors?: any;
}

export default function Stage(props: StageProps) {
    const {t} = useTranslation();
    return (
        <>
            {props.data?.length > 0 &&
                props.data.map((stage, index) => {
                    return (
                        <div key={`${index}-stage`}>
                            <div key={`${index}`} className="flex items-center">
                                <div className="mr-2">
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
                                        min={0}
                                        max={100}
                                        customClassName="min-w-48"
                                    />
                                </div>
                                <div className="mr-2">
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
                                        min={0}
                                        max={100}
                                        customClassName="min-w-48"
                                    />
                                </div>
                                <div className="mr-2">
                                    <Input
                                        name={`${props.inputName}[${index}].initTemperature`}
                                        value={stage?.initTemperature}
                                        onChange={props.handleChange}
                                        required={true}
                                        label={t('initTemperature')}
                                        type="number"
                                        error={
                                            props.errors &&
                                            props.errors.length > 0 &&
                                            props.errors[index]?.initTemperature
                                        }
                                        min={0}
                                        max={100}
                                        customClassName="min-w-48"
                                    />
                                </div>
                                <div className="">
                                    <Input
                                        name={`${props.inputName}[${index}].duration`}
                                        value={stage?.duration}
                                        onChange={props.handleChange}
                                        required={true}
                                        label={t('time')}
                                        type="number"
                                        error={
                                            props.errors &&
                                            props.errors.length > 0 &&
                                            props.errors[index]?.duration
                                        }
                                        min={0}
                                        customClassName="min-w-48"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
        </>
    );
}
