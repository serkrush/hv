export default function entity(entityName: string): (
    target: object
) => void {
    return (target: object): void => {
        Reflect.defineMetadata('entity', entityName, target)
    }
}