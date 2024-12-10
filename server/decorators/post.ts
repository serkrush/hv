import { GRANT, IAllowDeny } from "@/acl/types";
import { rules } from "@/config.acl";
import "reflect-metadata";
import { addMethodToRouteRules } from "./addMethodToRouteRules";

export default function POST(
    routeName: string = "*",
    routeRules: IAllowDeny = null
): (target: object, propertyKey: string) => void {
    return (target: object, propertyKey: string): void => {
        let properties: any = Reflect.getMetadata(routeName, target);
        if (Array.isArray(properties?.POST)) {
            properties.POST.push(propertyKey);
        } else {
            properties = { ...properties, POST: [propertyKey] };
            Reflect.defineMetadata(routeName, properties, target);
            if (routeRules != null) {
                const reg = /\/:(\w|\d|-)+/g;
                const route = routeName.replace(reg, "/*");
                rules[route] = addMethodToRouteRules(routeRules, GRANT.POST);
            }
        }
    };
}
