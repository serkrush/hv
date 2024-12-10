const kgToLbCoefficient = 2.2;
const sqMToSqFtCoefficient = 10.7639;

export const weightConvert = (value: number, isMetricToImperial: boolean = true) => {
    return isMetricToImperial ? value * kgToLbCoefficient : value / kgToLbCoefficient;
};