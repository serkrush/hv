export const temperatureConvert = (
    value: number,
    isMetricToImperial: boolean = true,
) => {
    if (isMetricToImperial) {
        return (value * 9) / 5 + 32;
    }
    return ((value - 32) * 5) / 9;
};