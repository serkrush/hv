import { IAllowDeny } from "@/acl/types";
import { rules } from "@/config.acl";
import "reflect-metadata";

export default function ACL(
  resource: string = "*",
  routeRules: IAllowDeny = null
): (target: object, propertyKey: string) => void {
  return (target: object, propertyKey: string): void => {
    if (routeRules != null) {
      rules[resource] = routeRules;
    }
  };
}
