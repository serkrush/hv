import Acl from "./Acl";
import { ROLE, IRoles, IRules, IIdentity, GRANT } from "./types";

const set = require("set-value");

class Guard {
    private mAcl: Acl;
    private mRoles: IRoles;
    private mRules: IRules;
    private mIdentity: IIdentity;
    public mResource: string;

    constructor(roles: IRoles, rules: IRules) {
        this.mRoles = roles;
        this.mRules = rules;
    }

    public get acl(): Acl {
        return this.mAcl;
    }
    public get roles(): IRoles {
        return this.mRoles;
    }
    public get rules(): IRules {
        return this.mRules;
    }

    public get role(): ROLE {
        return this.mIdentity.role;
    }

    public set resource(name: string) {
        this.mResource = name;
    }

    private isRouteMatch(path: string): string {
        // allow to use '/' in end of path
        if (path.length > 1 && path.substr(path.length - 1) === "/") {
            path = path.substr(0, path.length - 1);
        }
        const pParts = path && path.split("/");

        for (const resource in this.mRules) {
            if (this.mRules.hasOwnProperty(resource)) {
                const rParts = resource.split("/");
                if (rParts.length >= pParts.length) {
                    let result = null;
                    for (let i = 0; i < rParts.length; i++) {
                        if (!(rParts[i] === pParts[i] || rParts[i] === "*")) {
                            result = null;
                            break;
                        }
                        result = resource;
                    }
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return null;
    }

    public inRouter(resource: string) {
        let isRouter = false;
        try {
            if (this.mRules.hasOwnProperty(resource)) {
                isRouter = true;
            } else {
                const match = this.isRouteMatch(resource);
                if (match) {
                    if (this.mRules.hasOwnProperty(match)) {
                        isRouter = true;
                    }
                }
            }
        } catch (e) {
            isRouter = false;
        }
        return isRouter;
    }

    public allow(
        grant: GRANT,
        resource: string = null,
        secret = null,
        role = null
    ) {
        role = role ?? this.mIdentity.role;
        resource = resource ?? this.mResource;
        secret = secret ?? this.mIdentity.secret;
        const s = secret ? secret + ":" : "";
        let isAllowed = false;
        try {
            if (this.mRules.hasOwnProperty(resource)) {
                isAllowed = this.mAcl.isAllowed(s + role, s + resource, grant);
            } else {
                const match = this.isRouteMatch(resource);
                if (match) {
                    if (this.mRules.hasOwnProperty(match)) {
                        isAllowed = this.mAcl.isAllowed(
                            s + role,
                            s + match,
                            grant
                        );
                    }
                }
            }
        } catch (e) {
            isAllowed = false;
        }
        return isAllowed;
    }

    public build(identity: IIdentity) {
        const acl = new Acl();
        this.init(acl);
        if (identity.secret && identity.secret.length > 0) {
            this.init(acl, identity.secret);
        }
        this.mAcl = acl;
        this.mIdentity = identity;
        return this;
    }

    private init(acl: Acl, secret: string | null = null) {
        const s = secret !== null ? secret + ":" : "";
        for (const role in this.mRoles) {
            if (this.mRoles.hasOwnProperty(role)) {
                const item = this.mRoles[role];
                const parentRoleId = item.hasOwnProperty("parent")
                    ? item.parent
                    : null;
                let parentRole: string[] = null;
                if (parentRoleId !== null) {
                    parentRole = [];
                    parentRoleId.forEach((pRole) => parentRole.push(s + pRole));
                }
                const pr: string[] | string =
                    secret !== null && role === ROLE.GUEST
                        ? ROLE.GUEST
                        : parentRole;
                acl.addRole(s + role, pr);
            }
        }

        for (const resource in this.mRules) {
            if (this.mRules.hasOwnProperty(resource)) {
                if (secret === null) {
                    acl.addResource(resource);
                } else {
                    acl.addResource(s + resource, resource);
                }
            }
        }
        for (const resource in this.mRules) {
            if (this.mRules.hasOwnProperty(resource)) {
                const grant = this.mRules[resource];
                const res = s + resource;
                if (grant.hasOwnProperty("allow")) {
                    for (const role in grant.allow) {
                        if (grant.allow.hasOwnProperty(role)) {
                            const grants = grant.allow[role];
                            for (
                                let i = 0, size = grants.length;
                                i < size;
                                i++
                            ) {
                                acl.allow(s + role, res, grants[i]);
                            }
                        }
                    }
                }
                if (grant.hasOwnProperty("deny")) {
                    for (const role in grant.deny) {
                        if (grant.deny.hasOwnProperty(role)) {
                            const grants = grant.deny[role];
                            for (
                                let i = 0, size = grants.length;
                                i < size;
                                i++
                            ) {
                                acl.deny(s + role, res, grants[i]);
                            }
                        }
                    }
                }
            }
        }
    }

    public getCleanRoles() {
        const result: IRoles = {};
        const roles = this.roles;
        for (const item in roles) {
            if (roles.hasOwnProperty(item)) {
                if (
                    this.role === item ||
                    this.acl.inheritsRole(this.role, item)
                ) {
                    result[item] = roles[item];
                }
            }
        }
        return result;
    }

    public getCleanRules() {
        const result: IRules = {};
        for (const resource in this.rules) {
            if (this.rules.hasOwnProperty(resource)) {
                const grant = this.rules[resource];
                if (grant.hasOwnProperty("allow")) {
                    for (const r in grant.allow) {
                        if (grant.allow.hasOwnProperty(r)) {
                            if (
                                this.role === r ||
                                this.acl.inheritsRole(this.role, r)
                            ) {
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
                            if (
                                this.role === r ||
                                this.acl.inheritsRole(this.role, r)
                            ) {
                                set(
                                    result,
                                    `${resource}.deny.${r}`,
                                    grant.deny[r]
                                );
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}

export default Guard;
