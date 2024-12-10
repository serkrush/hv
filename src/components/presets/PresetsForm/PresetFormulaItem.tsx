import React from 'react';
import Input from '../../Form/Input';
import {useTranslation} from 'react-i18next';

interface PresetFormulaItemProps {
    data: any;
    inputName: string;
    title: string;
    handleChange: (event: any) => void;
    errors?: any;
    tooltipTextTemperature?: string;
    tooltipTextTime?: string;
}

export default function PresetFormulaItem(props: PresetFormulaItemProps) {
    const {t} = useTranslation();
    return (
        <>
            <p>{props.title}</p>
            <div className="">
                <Input
                    classNameContainer="mt-3"
                    name={`temperature.${props.inputName}`}
                    value={
                        props?.data?.temperature &&
                        props.data.temperature[props.inputName]
                    }
                    onChange={props.handleChange}
                    required={true}
                    label={t('temperature')}
                    type="number"
                    min={0}
                    max={100}
                    error={
                        props.errors?.temperature &&
                        (props.errors?.temperature[props.inputName] as string)
                    }
                    tooltipText={props.tooltipTextTemperature}
                />
                <Input
                    classNameContainer="mt-3"
                    name={`time.${props.inputName}`}
                    value={
                        props?.data?.time && props.data.time[props.inputName]
                    }
                    onChange={props.handleChange}
                    required={true}
                    label={t('time')}
                    type="number"
                    min={0}
                    error={
                        props.errors?.time &&
                        (props.errors?.time[props.inputName] as string)
                    }
                    tooltipText={props.tooltipTextTime}
                />
            </div>
        </>
    );
}
