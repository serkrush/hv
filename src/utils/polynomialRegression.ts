import {PolynomialRegression} from 'ml-regression-polynomial';
import { thicknesses } from '../constants';

function calculateExpectedDryingTimes(
    baseTime: number,
    thicknesses: number[],
): number[] {
    return thicknesses.map(
        thickness => (baseTime * Math.log(thickness)) / Math.log(5),
    );
}

function convertToHoursMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours} hrs ${mins} mins`;
}

export function fitPolynomialRegression(
    // fruitName: string,
    baseTime: number,
    moistureContent: number,
    thickness: number,
) {
    const expectedTimes = calculateExpectedDryingTimes(baseTime, thicknesses);

    // Polynomial Regression (degree 4 for better fit)
    const regression = new PolynomialRegression(thicknesses, expectedTimes, 4);

    // Predicting drying times
    const predictedTimes = thicknesses.map(thickness =>
        Math.round(regression.predict(thickness)),
    );

    // Convert predicted times to hours and minutes
    const predictedTimesHM = predictedTimes.map(time =>
        convertToHoursMinutes(time),
    );
    return predictedTimesHM[thickness - 1];
}
