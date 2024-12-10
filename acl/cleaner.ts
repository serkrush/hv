if (typeof document !== "undefined") {
    throw new Error(
        "Do not import `acl/cleaner` from inside the client-side code."
    );
}

const set = require("set-value");

import Guard from "./Guard";
import { IRoles, ROLE, IRules } from "./types";
import Acl from "./Acl";

export function cleanRoles(guard: Guard, role: ROLE): IRoles {
    const result: IRoles = {};
    const roles = guard.roles;
    const acl: Acl = guard.acl;
    for (const item in roles) {
        if (roles.hasOwnProperty(item)) {
            if (role === item || acl.inheritsRole(role, item)) {
                result[item] = roles[item];
            }
        }
    }
    return result;
}

export function cleanRules(guard: Guard, role: ROLE): IRules {
    const result: IRules = {};
    const rules = guard.rules;
    const acl: Acl = guard.acl;
    for (const resource in rules) {
        if (rules.hasOwnProperty(resource)) {
            const grant = rules[resource];
            if (grant.hasOwnProperty("allow")) {
                for (const r in grant.allow) {
                    if (grant.allow.hasOwnProperty(r)) {
                        if (role === r || acl.inheritsRole(role, r)) {
                            set(
                                result,
                                `${resource}.allow.${r}`,
                                grant.allow[r]
                            );
                        }
                    }
                }
            }
            if (grant.hasOwnProperty("deny")) {
                for (const r in grant.deny) {
                    if (grant.deny.hasOwnProperty(r)) {
                        if (role === r || acl.inheritsRole(role, r)) {
                            set(result, `${resource}.deny.${r}`, grant.deny[r]);
                        }
                    }
                }
            }
        }
    }
    return result;
}
