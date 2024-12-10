import { GRANT, IAllowDeny } from '@/acl/types';
import { rules } from '@/config.acl';
import 'reflect-metadata';
import { addMethodToRouteRules } from './addMethodToRouteRules';

export default function SSR(
    routeName: string = '*',
    routeRules: IAllowDeny = null
): (target: object, propertyKey: string) => void {
    return (target: object, propertyKey: string): void => {
        let properties: any = Reflect.getMetadata(routeName, target);
    
        if (Array.isArray(properties?.SSR)) {
            properties.SSR.push(propertyKey);
        } else {
            properties = { ...properties, SSR: [propertyKey] };
            Reflect.defineMetadata(routeName, properties, target);
            if (routeRules != null) {
                const reg = /\/:(\w|\d|-)+/g;
                const route = routeName.replace(reg, "/*");
                rules[route] =  addMethodToRouteRules(routeRules, GRANT.GET);;
            }
        }
    };
}