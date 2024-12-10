import 'reflect-metadata';
import {BaseEntity} from '../BaseEntity';

export default function action(): (
    target: object,
    propertyKey: string,
) => void {
    return (target: object, methodName: string): void => {
        let sagas: any = Reflect.getMetadata('sagas', BaseEntity) || [];
        sagas.push({className: target.constructor.name, methodName});
        Reflect.defineMetadata('sagas', sagas, BaseEntity);
    };
}
