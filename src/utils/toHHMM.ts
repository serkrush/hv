export function toHHMM(value: number | string) {
    const secNum = typeof value === 'string' ? parseInt(value, 10) : value;
    let hours: number | string = Math.floor(secNum / 3600);
    let minutes: number | string = Math.floor((secNum - hours * 3600) / 60);
    let seconds: number | string = secNum - hours * 3600 - minutes * 60;
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
}