import { IAllowDeny, GRANT } from "@/acl/types";

export function addMethodToRouteRules(routeRules: IAllowDeny, method: GRANT) {
    if(routeRules.allow) {
        routeRules.allow = Object.entries(routeRules.allow).reduce((acc, [key, value]) => {
            acc[key] = [...value, method]
            return acc;
        }, {} as any)
    }
    if(routeRules.deny) {
        routeRules.deny = Object.entries(routeRules.deny).reduce((acc, [key, value]) => {
            acc[key] = [...value, method]
            return acc;
        }, {} as any)
    }
    return routeRules;
}