import {IRecipeEntity, IStageEntity} from '@/src/entities/EntityTypes';

export const validatePresetForm = (values: IRecipeEntity, t: any) => {
    const errors: Partial<IRecipeEntity> = {};

    if (!values.recipe_name) {
        errors.recipe_name = t('required');
    }
    if (!values.machine_type) {
        errors.machine_type = t('required');
    }
    if (values.stages && values.stages.length > 0) {
        const stagesErrors: any[] = values.stages.map(
            (stage: IStageEntity, index) => {
                const stageErrors = {} as any;
                if (!stage.fanPerformance1) {
                    stageErrors.fanPerformance1 = t('required');
                }
                if (stage.fanPerformance1 && stage.fanPerformance1 < 0) {
                    stageErrors.fanPerformance1 = t('input-number-error-min', {
                        min: 0,
                    });
                }
                if (stage.fanPerformance1 && stage.fanPerformance1 > 100) {
                    stageErrors.fanPerformance1 = t('input-number-error-max', {
                        max: 100,
                    });
                }
                if (stage.fanPerformance2 && stage.fanPerformance2 < 0) {
                    stageErrors.fanPerformance2 = t('input-number-error-min', {
                        min: 0,
                    });
                }
                if (stage.fanPerformance2 && stage.fanPerformance2 > 100) {
                    stageErrors.fanPerformance2 = t('input-number-error-max', {
                        max: 100,
                    });
                }
                if (!stage.initTemperature) {
                    stageErrors.initTemperature = t('required');
                }
                if (stage.initTemperature && stage.initTemperature < 0) {
                    stageErrors.initTemperature = t('input-number-error-min', {
                        min: 0,
                    });
                }
                if (stage.initTemperature && stage.initTemperature > 100) {
                    stageErrors.initTemperature = t('input-number-error-max', {
                        max: 100,
                    });
                }
                if (!stage.duration) {
                    stageErrors.duration = t('required');
                }
                if (stage.initTemperature && stage.initTemperature < 0) {
                    stageErrors.initTemperature = t('input-number-error-min', {
                        min: 0,
                    });
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

    if (!values.base_thickness) {
        errors.base_thickness = t('required') as any;
    }
    if (values.base_thickness && values.base_thickness < 0) {
        errors.base_thickness = t('input-number-error-min', {min: 0}) as any;
    }

    const initTemperatureErrors = {} as any;
    if (
        !values.temperature ||
        (!values.temperature.adjustment && values.temperature.adjustment !== 0)
    ) {
        initTemperatureErrors.adjustment = t('required');
    }
    if (
        !values.temperature ||
        (!values.temperature.marinated && values.temperature.marinated !== 0)
    ) {
        initTemperatureErrors.marinated = t('required');
    }
    if (
        !values.temperature ||
        (!values.temperature.thickness && values.temperature.thickness !== 0)
    ) {
        initTemperatureErrors.thickness = t('required');
    }
    if (Object.keys(initTemperatureErrors).length > 0) {
        errors.temperature = initTemperatureErrors;
    }

    const timeErrors = {} as any;
    if (
        !values.time ||
        (!values.time.adjustment && values.time.adjustment !== 0)
    ) {
        timeErrors.adjustment = t('required');
    }
    if (
        !values.time ||
        (!values.time.marinated && values.time.marinated !== 0)
    ) {
        timeErrors.marinated = t('required');
    }
    if (
        !values.time ||
        (!values.time.thickness && values.time.thickness !== 0)
    ) {
        timeErrors.thickness = t('required');
    }
    if (Object.keys(timeErrors).length > 0) {
        errors.time = timeErrors;
    }

    if (!values.categories || values?.categories?.length === 0) {
        errors.categories = [t('required')];
    }
    return errors;
};
