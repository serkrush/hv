import 'reflect-metadata';
import {BaseEntity} from '../BaseEntity';

export default function reducer(
    reducerName: string,
): (target: any, propertyKey?: string | undefined) => void {
    return (target: any, propertyKey?: string | undefined): void => {
        let reducers: any = Reflect.getMetadata('reducers', BaseEntity) || [];
        reducers.push({reducerName});
        Reflect.defineMetadata('reducers', reducers, BaseEntity);
    };
}
