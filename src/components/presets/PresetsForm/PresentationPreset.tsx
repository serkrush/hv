import React, {useEffect, useState} from 'react';
import {IRecipeEntity} from '@/src/entities/EntityTypes';
import {useTranslation} from 'react-i18next';
import Input from '../../Form/Input';
import Slider from '../../Form/Slider';
import Checkbox from '../../Form/Checkbox';
import {fitPolynomialRegression} from '@/src/utils/polynomialRegression';
import Select from '../../Form/Select';
import {thicknesses} from '@/src/constants';

interface iPresetFormProps {
    values?: IRecipeEntity;
}

export default function PresentationPreset(props: iPresetFormProps) {
    const {t} = useTranslation();
    const [thicknessPresentation, setThicknessPresentation] = useState(
        props.values.base_thickness,
    );
    const [sliderValue, setSliderValue] = useState(0);
    const [marinatedPresentation, setMarinatedValue] = useState(false);

    useEffect(() => {
        setThicknessPresentation(props.values.base_thickness);
    }, [props.values.base_thickness]);

    const handleAdjustmentPresentationChange = value => {
        setSliderValue(value);
    };
    const handleThicknessPresentationChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = parseFloat(event.target.value);
        setThicknessPresentation(isNaN(value) ? 0 : value);
    };
    const handleMarinatedPresentationChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setMarinatedValue(event.target.checked);
    };

    const adjustmentPresentationTemperature =
        sliderValue * props.values.temperature.adjustment;
    const marinatedPresentationTemperature = marinatedPresentation
        ? props.values.temperature.marinated
        : 0;

    const adjustmentPresentationTime =
        sliderValue * props.values.time.adjustment;
    const marinatedPresentationTime = marinatedPresentation
        ? props.values.time.marinated
        : 0;

    return (
        <>
            <p className="mt-8 text-center text-2xl font-bold text-gray-900">
                {t('calculator')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-4">
                <div>
                    <div>
                        <p className="text-gray-900">{t('thickness')}</p>
                        {/* <Input
                            name="thickness_presentation"
                            value={thicknessPresentation}
                            onChange={handleThicknessPresentationChange}
                            type="number"
                        /> */}
                        <Select
                            name="thickness_presentation"
                            data={thicknesses.map(thickness => ({
                                label: `${thickness}`,
                                value: `${thickness}`,
                            }))}
                            value={thicknessPresentation}
                            onChange={handleThicknessPresentationChange}
                            // required={true}
                            // error={formik.errors.machine_type as string}
                            // label={t('machine-type')}
                        />
                    </div>
                    <div className="mt-6">
                        <p className="text-gray-900">{t('adjustment')}</p>
                        <Slider
                            included={false}
                            defaultValue={0}
                            min={-3}
                            max={3}
                            handleChange={handleAdjustmentPresentationChange}
                            marks={{
                                '-3': 'LESS',
                                '-2': ' ',
                                '-1': ' ',
                                0: ' ',
                                1: ' ',
                                2: ' ',
                                3: 'MOR',
                            }}
                        />
                    </div>
                    <div className="mt-8">
                        <p className="text-gray-900">{t('marinated')}</p>
                        <Checkbox
                            label={t('marinated')}
                            name={'marinated'}
                            onChange={handleMarinatedPresentationChange}
                            checked={marinatedPresentation}
                        />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    {props.values?.stages?.length > 0 &&
                        props.values?.stages.map((stage, index) => {
                            return (
                                <div key={`stage-${index}`} className="mt-2">
                                    <div className="text-xl">
                                        {`${t('temperature')}: ${
                                            stage.initTemperature +
                                            adjustmentPresentationTemperature +
                                            marinatedPresentationTemperature
                                        }`}
                                    </div>
                                    <div className="text-xl">
                                        {`${t(
                                            'time',
                                        )}: ${fitPolynomialRegression(
                                            stage.duration +
                                                adjustmentPresentationTime +
                                                marinatedPresentationTime,
                                            0,
                                            thicknessPresentation,
                                        )}`}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </>
    );
}
