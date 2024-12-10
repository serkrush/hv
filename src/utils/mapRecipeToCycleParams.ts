import {IZoneParams} from '@/server/models/ICycleModel';
import {IRecipeModel} from '@/server/models/IRecipeModel';

const mapRecipeToCycleParams = (recipe: IRecipeModel): IZoneParams[] => {
    const params =
        recipe.stages?.length > 0
            ? recipe.stages.map(stage => {
                return {
                    initTemperature: stage.initTemperature,
                    heatingIntensity: stage.heatingIntensity,
                    fanPerformance1: stage.fanPerformance1,
                    fanPerformance2: stage.fanPerformance2,
                    duration: stage.duration ? stage.duration : 0,
                    weight: 0,
                };
            })
            : [];

    return params;
};

export default mapRecipeToCycleParams;
