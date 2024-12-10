export default function pager(): (
    target: object,
    propertyKey: string
) => void {
    return (target: object, methodName: string): void => {
        let pagers: any = Reflect.getMetadata('pagers', target) || []
        pagers.push({methodName})
        Reflect.defineMetadata('pagers', pagers, target)
    }
}