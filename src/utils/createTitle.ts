export function createTitle(main: string, sub?: string) {
    if(sub) {
        return `${main} | ${sub}`
    }
    return main
}