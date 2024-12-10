// @ts-ignore-begin
const set = require("set-value");

import AclInterface from "./AclInterface";
import Registry from "./role/Registry";
import RoleInterface from "./role/RoleInterface";
import GenericRole from "./role/GenericRole";
import ResourceInterface from "./resource/ResourceInterface";
import GenericResource from "./resource/GenericResource";

export enum TYPE {
    ALLOW = "allow",
    DENY = "deny",
}

export enum OPERATION {
    ADD = "add",
    REMOVE = "remove",
}

interface IAclRules {
    allResources: {
        allRoles: {
            allPrivileges: {
                type: TYPE.DENY;
                assert: null;
            };
            byPrivilegeId: any;
        };
        byRoleId: any;
    };
    byResourceId: any;
}

interface IVisitedStack {
    visited: any[];
    stack: any[];
}

export default class Acl implements AclInterface {
    protected roleRegistry: Registry;

    protected resources: any;

    /**
     * ACL rules; whitelist (deny everything to all) by default
     */
    protected rules: IAclRules = {
        allResources: {
            allRoles: {
                allPrivileges: {
                    type: TYPE.DENY,
                    assert: null,
                },
                byPrivilegeId: {},
            },
            byRoleId: {},
        },
        byResourceId: {},
    };

    constructor() {
        this.roleRegistry = null;
        this.resources = {};
    }

    /**
     * Adds a Role having an identifier unique to the registry
     *
     * The $parents parameter may be a reference to, or the string identifier for,
     * a Role existing in the registry, or $parents may be passed as an array of
     * these - mixing string identifiers and objects is ok - to indicate the Roles
     * from which the newly added Role will directly inherit.
     *
     * In order to resolve potential ambiguities with conflicting rules inherited
     * from different parents, the most recently added parent takes precedence over
     * parents that were previously added. In other words, the first parent added
     * will have the least priority, and the last parent added will have the
     * highest priority.
     *
     * @param {Role\RoleInterface|string} role
     * @param {Role\RoleInterface|string|array} parents
     * @throws {InvalidArgumentException}
     * @return {Acl} Provides a fluent interface
     */
    public addRole(
        role: RoleInterface | string,
        parents: RoleInterface | string | string[] = null
    ) {
        let genericRole = null;
        if (typeof role === "string") {
            genericRole = new GenericRole(role);
        } else if (!role.getRoleId) {
            throw new Error(
                `addRole() expects ${genericRole} to be of type RoleInterface`
            );
        }
        this.getRoleRegistry().add(genericRole, parents);
        return this;
    }

    /**
     * Returns the identified Role
     *
     * The $role parameter can either be a Role or Role identifier.
     *
     * @param  {RoleInterface|string} role
     * @return {RoleInterface}
     */
    public getRole(role: RoleInterface | string): RoleInterface {
        return this.getRoleRegistry().get(role);
    }

    /**
     * Returns true if and only if the Role exists in the registry
     *
     * The $role parameter can either be a Role or a Role identifier.
     *
     * @param  {RoleInterface|string} role
     * @return {bool}
     */
    public hasRole(role: RoleInterface | string): boolean {
        return this.getRoleRegistry().has(role);
    }

    /**
     * Returns true if and only if $role inherits from $inherit
     *
     * Both parameters may be either a Role or a Role identifier. If
     * $onlyParents is true, then $role must inherit directly from
     * $inherit in order to return true. By default, this method looks
     * through the entire inheritance DAG to determine whether $role
     * inherits from $inherit through its ancestor Roles.
     *
     * @param  {RoleInterface|string} role
     * @param  {RoleInterface|string} inherit
     * @param  {bool}                 onlyParents
     * @return {bool}
     */
    public inheritsRole(
        role: RoleInterface | string,
        inherit: RoleInterface | string,
        onlyParents = false
    ): boolean {
        return this.getRoleRegistry().inherits(role, inherit, onlyParents);
    }

    /**
     * Removes the Role from the registry
     *
     * The $role parameter can either be a Role or a Role identifier.
     *
     * @param  {RoleInterface|string} role
     * @return {Acl} Provides a fluent interface
     */
    public removeRole(role: RoleInterface | string): Acl {
        this.getRoleRegistry().remove(role);

        let roleId = role.toString();
        if (typeof role !== "string" && role.getRoleId) {
            roleId = role.getRoleId();
        }

        for (const roleIdCurrent in this.rules["allResources"]["byRoleId"]) {
            if (roleId === roleIdCurrent) {
                delete this.rules["allResources"]["byRoleId"][roleIdCurrent];
            }
        }

        for (const resourceIdCurrent in this.rules["byResourceId"]) {
            const visitor = this.rules["byResourceId"][resourceIdCurrent];
            if (visitor.hasOwnProperty("byRoleId")) {
                for (const roleIdCurrent in visitor["byRoleId"]) {
                    if (roleId === roleIdCurrent) {
                        delete this.rules["byResourceId"][resourceIdCurrent][
                            "byRoleId"
                        ][roleIdCurrent];
                    }
                }
            }
        }
        return this;
    }

    /**
     * Removes all Roles from the registry
     *
     * @return {Acl} Provides a fluent interface
     */
    public removeRoleAll() {
        this.getRoleRegistry().removeAll();

        for (const roleIdCurrent in this.rules["allResources"]["byRoleId"]) {
            delete this.rules["allResources"]["byRoleId"][roleIdCurrent];
        }

        for (const resourceIdCurrent in this.rules["byResourceId"]) {
            const visitor = this.rules["byResourceId"][resourceIdCurrent];
            for (const roleIdCurrent in visitor["byRoleId"]) {
                delete this.rules["byResourceId"][resourceIdCurrent][
                    "byRoleId"
                ][roleIdCurrent];
            }
        }

        return this;
    }

    /**
     * Adds a Resource having an identifier unique to the ACL
     *
     * The $parent parameter may be a reference to, or the string identifier for,
     * the existing Resource from which the newly added Resource will inherit.
     *
     * @param  {ResourceInterface|string} resource
     * @param  {ResourceInterface|string} parent
     * @throws {InvalidArgumentException}
     * @return {Acl} Provides a fluent interface
     */
    public addResource(
        resource: ResourceInterface | string,
        parent: ResourceInterface | string = null
    ): Acl {
        let genericResource = null;
        if (typeof resource === "string") {
            genericResource = new GenericResource(resource);
        } else if (!resource.getResourceId) {
            throw new Error(
                `addResource() expects ${resource} to be of type ResourceInterface`
            );
        }
        const resourceId = genericResource.getResourceId();
        if (this.hasResource(resourceId)) {
            throw new Error(
                `Resource id ${resourceId} already exists in the ACL`
            );
        }
        let resourceParent = null;
        if (parent !== null) {
            let resourceParentId = parent.toString();
            try {
                if (typeof parent !== "string" && parent.getResourceId) {
                    resourceParentId = parent.getResourceId();
                }
                resourceParent = this.getResource(resourceParentId);
            } catch (e) {
                throw new Error(
                    `InvalidArgumentException: Parent Resource id ${resourceParentId} does not exist'`
                );
            }
            set(
                this.resources,
                `${resourceParentId}.children.${resourceId}`,
                genericResource
            );
        }
        this.resources[resourceId] = {
            instance: genericResource,
            parent: resourceParent,
            children: {},
        };
        return this;
    }

    /**
     * Returns the identified Resource
     *
     * The $resource parameter can either be a Resource or a Resource identifier.
     *
     * @param  {ResourceInterface|string} resource
     * @throws {InvalidArgumentException}
     * @return {Resource}
     */
    public getResource(
        resource: ResourceInterface | string
    ): ResourceInterface {
        let resourceId = resource.toString();
        if (typeof resource !== "string" && resource.getResourceId) {
            resourceId = resource.getResourceId();
        }
        if (!this.hasResource(resource)) {
            throw new Error(`Resource ${resourceId} not found`);
        }
        return this.resources[resourceId]["instance"];
    }

    /**
     * Returns true if and only if the Resource exists in the ACL
     *
     * The $resource parameter can either be a Resource or a Resource identifier.
     *
     * @param  {ResourceInterface|string} resource
     * @return {boolean}
     */
    public hasResource(resource: ResourceInterface | string): boolean {
        const resourceId =
            typeof resource === "string" ? resource : resource.getResourceId();
        return this.resources.hasOwnProperty(resourceId);
    }

    /**
     * Returns true if and only if $resource inherits from $inherit
     *
     * Both parameters may be either a Resource or a Resource identifier. If
     * $onlyParent is true, then $resource must inherit directly from
     * $inherit in order to return true. By default, this method looks
     * through the entire inheritance tree to determine whether $resource
     * inherits from $inherit through its ancestor Resources.
     *
     * @param  {ResourceInterface|string}    resource
     * @param  {ResourceInterface|string}    inherit
     * @param  {bool}                        onlyParent
     * @throws {InvalidArgumentException}
     * @return {bool}
     */
    public inheritsResource(
        resource: ResourceInterface | string,
        inherit: ResourceInterface | string,
        onlyParent = false
    ): boolean {
        try {
            const resourceId = this.getResource(resource).getResourceId();
            const inheritId = this.getResource(inherit).getResourceId();

            let parentId = null;
            if (this.resources[resourceId]["parent"] !== null) {
                parentId = this.resources[resourceId]["parent"].getResourceId();
                if (inheritId === parentId) {
                    return true;
                } else if (onlyParent) {
                    return false;
                }
            } else {
                return false;
            }
            while (this.resources[parentId]["parent"] !== null) {
                const id = this.resources[parentId]["parent"].getResourceId();
                if (inheritId === id) {
                    return true;
                }
            }
        } catch (e) {
            throw new Error("InvalidArgumentException: " + e);
        }
        return false;
    }

    /**
     * Removes a Resource and all of its children
     *
     * The $resource parameter can either be a Resource or a Resource identifier.
     *
     * @param  { ResourceInterface|string } resource
     * @throws { InvalidArgumentException }
     * @return { Acl } Provides a fluent interface
     */
    public removeResource(resource: ResourceInterface | string): Acl {
        try {
            const resourceId = this.getResource(resource).getResourceId();

            const resourcesRemoved = [resourceId];
            const resourceParent = this.resources[resourceId]["parent"];
            if (resourceParent !== null) {
                delete this.resources[resourceParent.getResourceId()][
                    "children"
                ][resourceId];
            }

            for (const childId in this.resources[resourceId]["children"]) {
                this.removeResource(childId);
                resourcesRemoved.push(childId);
            }

            for (let i = 0, size = resourcesRemoved.length; i < size; i++) {
                const resourceIdRemoved = resourcesRemoved[i];
                for (const resourceIdCurrent in this.rules["byResourceId"]) {
                    if (resourceIdRemoved === resourceIdCurrent) {
                        delete this.rules["byResourceId"][resourceIdCurrent];
                    }
                }
            }

            delete this.resources[resourceId];
        } catch (e) {
            throw new Error("InvalidArgumentException: " + e);
        }

        return this;
    }

    /**
     * Removes all Resources
     *
     * @return {Acl} Provides a fluent interface
     */
    public removeResourceAll(): Acl {
        for (const resourceId in this.resources) {
            delete this.rules["byResourceId"][resourceId];
        }
        this.resources = {};
        return this;
    }

    /**
     * Returns the Role registry for this ACL
     *
     * If no Role registry has been created yet, a new default Role registry
     * is created and returned.
     */
    protected getRoleRegistry() {
        if (this.roleRegistry === null) {
            this.roleRegistry = new Registry();
        }
        return this.roleRegistry;
    }

    /**
     * Adds an "allow" rule to the ACL
     *
     * @param  {RoleInterface|string|(RoleInterface|string)[]} roles
     * @param  {ResourceInterface|string|(ResourceInterface|string)[]} resources
     * @param  {string|string[]} privileges
     * @return {Acl} Provides a fluent interface
     */
    public allow(
        roles: RoleInterface | string | Array<RoleInterface | string> = null,
        resources:
            | ResourceInterface
            | string
            | Array<ResourceInterface | string> = null,
        privileges: string | string[] = null
    ): Acl {
        return this.setRule(
            OPERATION.ADD,
            TYPE.ALLOW,
            roles,
            resources,
            privileges
        );
    }

    /**
     * Adds a "deny" rule to the ACL
     *
     * @param  {RoleInterface|string|(RoleInterface|string)[]} roles
     * @param  {ResourceInterface|string|(ResourceInterface|string)[]} resources
     * @param  {string|string[]} privileges
     * @return {Acl} Provides a fluent interface
     */
    public deny(
        roles: RoleInterface | string | Array<RoleInterface | string> = null,
        resources:
            | ResourceInterface
            | string
            | Array<ResourceInterface | string> = null,
        privileges: string | string[] = null
    ): Acl {
        return this.setRule(
            OPERATION.ADD,
            TYPE.DENY,
            roles,
            resources,
            privileges
        );
    }

    /**
     * Removes "allow" permissions from the ACL
     *
     * @param  {RoleInterface|string|(RoleInterface|string)[]} roles
     * @param  {ResourceInterface|string|string[]} resources
     * @param  {string|string[]} privileges
     * @return {Acl} Provides a fluent interface
     */
    public removeAllow(
        roles: RoleInterface | string | Array<RoleInterface | string> = null,
        resources:
            | ResourceInterface
            | string
            | Array<ResourceInterface | string> = null,
        privileges: string | string[] = null
    ): Acl {
        return this.setRule(
            OPERATION.REMOVE,
            TYPE.ALLOW,
            roles,
            resources,
            privileges
        );
    }

    /**
     * Removes "deny" restrictions from the ACL
     *
     * @param  {RoleInterface|string|(RoleInterface|string)[]} roles
     * @param  {ResourceInterface|string|(ResourceInterface|string)[]} resources
     * @param  {string|string[]} privileges
     * @return {Acl} Provides a fluent interface
     */
    public removeDeny(
        roles: RoleInterface | string | Array<RoleInterface | string> = null,
        resources:
            | ResourceInterface
            | string
            | Array<ResourceInterface | string> = null,
        privileges: string | string[] = null
    ): Acl {
        return this.setRule(
            OPERATION.REMOVE,
            TYPE.DENY,
            roles,
            resources,
            privileges
        );
    }

    /**
     * Performs operations on ACL rules
     *
     * The $operation parameter may be either OP_ADD or OP_REMOVE, depending on whether the
     * user wants to add or remove a rule, respectively:
     *
     * OP_ADD specifics:
     *
     *      A rule is added that would allow one or more Roles access to [certain $privileges
     *      upon] the specified Resource(s).
     *
     * OP_REMOVE specifics:
     *
     *      The rule is removed only in the context of the given Roles, Resources, and privileges.
     *      Existing rules to which the remove operation does not apply would remain in the
     *      ACL.
     *
     * The $type parameter may be either TYPE_ALLOW or TYPE_DENY, depending on whether the
     * rule is intended to allow or deny permission, respectively.
     *
     * The $roles and $resources parameters may be references to, or the string identifiers for,
     * existing Resources/Roles, or they may be passed as arrays of these - mixing string identifiers
     * and objects is ok - to indicate the Resources and Roles to which the rule applies. If either
     * $roles or $resources is null, then the rule applies to all Roles or all Resources, respectively.
     * Both may be null in order to work with the default rule of the ACL.
     *
     * The $privileges parameter may be used to further specify that the rule applies only
     * to certain privileges upon the Resource(s) in question. This may be specified to be a single
     * privilege with a string, and multiple privileges may be specified as an array of strings.
     *
     * If $assert is provided, then its assert() method must return true in order for
     * the rule to apply. If $assert is provided with $roles, $resources, and $privileges all
     * equal to null, then a rule having a type of:
     *
     *      TYPE_ALLOW will imply a type of TYPE_DENY, and
     *
     *      TYPE_DENY will imply a type of TYPE_ALLOW
     *
     * when the rule's assertion fails. This is because the ACL needs to provide expected
     * behavior when an assertion upon the default ACL rule fails.
     *
     * @param  {string} operation
     * @param  {string} type
     * @param  {RoleInterface|string|(RoleInterface|string)[]} roles
     * @param  {ResourceInterface|string|(ResourceInterface|string)[]} resources
     * @param  {string|string[]} privileges
     * @param  {AssertionInterface } assert
     * @throws {InvalidArgumentException}
     * @return {Acl} Provides a fluent interface
     */
    public setRule(
        operation: OPERATION,
        type: TYPE,
        pRoles: RoleInterface | string | Array<RoleInterface | string> = null,
        pResources:
            | ResourceInterface
            | string
            | Array<ResourceInterface | string> = null,
        pPrivileges: string | string[]
    ): Acl {
        // ensure that all specified Roles exist; normalize input to array of Role objects or null
        let roles: any = pRoles;
        if (!Array.isArray(roles)) {
            roles = [roles];
        } else if (roles.length === 0) {
            roles = [null];
        }
        const rolesTemp: any[] = roles;
        roles = [];
        rolesTemp.forEach((role) => {
            if (role !== null) {
                roles.push(this.getRoleRegistry().get(role));
            } else {
                roles.push(null);
            }
        });

        // ensure that all specified Resources exist; normalize input to array of Resource objects or null
        let resources: any = pResources;
        if (!Array.isArray(resources)) {
            if (resources === null && this.resources.length > 0) {
                resources = Object.keys(this.resources);
                // Passing a null resource; make sure "global" permission is also set!
                if (!resources.includes(null)) {
                    resources.unshift(null);
                }
            } else {
                resources = [resources];
            }
        } else if (resources.length === 0) {
            resources = [null];
        }
        const resourcesTemp: any[] = resources;
        resources = [];
        resourcesTemp.forEach((resource) => {
            if (resource !== null) {
                const resourceObj = this.getResource(resource);
                const resourceId = resourceObj.getResourceId();
                const children = this.getChildResources(resourceObj);
                resources = { ...resources, ...children };
                resources[resourceId] = resourceObj;
            } else {
                resources.push(null);
            }
        });

        // normalize privileges to array
        let privileges: any = pPrivileges;
        if (privileges === null) {
            privileges = [];
        } else if (!Array.isArray(privileges)) {
            privileges = [privileges];
        }

        switch (operation) {
            case OPERATION.ADD:
                for (const resKey in resources) {
                    const resource = resources[resKey];
                    for (const roleKey in roles) {
                        const role = roles[roleKey];
                        const rules = this.getRules(resource, role, true);
                        if (privileges.length === 0) {
                            set(rules, "allPrivileges.type", type);
                            if (!rules.hasOwnProperty("byPrivilegeId")) {
                                rules["byPrivilegeId"] = {};
                            }
                        } else {
                            for (const privKey in privileges) {
                                const privilege = privileges[privKey];
                                set(
                                    rules,
                                    `byPrivilegeId.${privilege}.type`,
                                    type
                                );
                            }
                        }
                    }
                }
                break;

            case OPERATION.REMOVE:
                for (const resKey in resources) {
                    const resource = resources[resKey];
                    for (const roleKey in roles) {
                        const role = roles[roleKey];
                        const rules = this.getRules(resource, role, true);
                        if (rules === null) {
                            return null;
                        }
                        if (privileges.length === 0) {
                            if (resource === null && role === null) {
                                if (type === rules["allPrivileges"]["type"]) {
                                    set(rules, "allPrivileges.type", TYPE.DENY);
                                    set(rules, "byPrivilegeId", []);
                                    // rules = {
                                    //     'allPrivileges': {
                                    //         'type'   : TYPE.DENY,
                                    //     },
                                    //     'byPrivilegeId': []
                                    // };
                                }
                                return null;
                            }
                            if (
                                rules["allPrivileges"].hasOwnProperty("type") &&
                                type === rules["allPrivileges"]["type"]
                            ) {
                                delete rules["allPrivileges"];
                            }
                        } else {
                            for (const privKey in privileges) {
                                const privilege = privileges[privKey];
                                if (
                                    rules["byPrivilegeId"].hasOwnProperty(
                                        privilege
                                    ) &&
                                    type ===
                                        rules["byPrivilegeId"][privilege][
                                            "type"
                                        ]
                                ) {
                                    delete rules["byPrivilegeId"][privilege];
                                }
                            }
                        }
                    }
                }
                break;

            default:
                throw new Error(
                    "InvalidArgumentException: Unsupported operation; must be either"
                );
        }
        return this;
    }

    /**
     * Returns all child resources from the given resource.
     *
     * @param  {ResourceInterface|string} resource
     * @return {ResourceInterface[]}
     */
    protected getChildResources(
        resource: ResourceInterface
    ): ResourceInterface[] {
        let result: ResourceInterface[] = [];
        const id = resource.getResourceId();
        const children: ResourceInterface[] = this.resources[id]["children"];

        for (const key in children) {
            const child: ResourceInterface = children[key];
            const child_return = this.getChildResources(child);
            // @ts-ignore
            child_return[child.getResourceId()] = child;
            result = { ...result, ...child_return };
        }
        return result;
    }

    /**
     * Returns true if and only if the Role has access to the Resource
     *
     * The $role and $resource parameters may be references to, or the string identifiers for,
     * an existing Resource and Role combination.
     *
     * If either $role or $resource is null, then the query applies to all Roles or all Resources,
     * respectively. Both may be null to query whether the ACL has a "blacklist" rule
     * (allow everything to all). By default, Zend\Permissions\Acl creates a "whitelist" rule (deny
     * everything to all), and this method would return false unless this default has
     * been overridden (i.e., by executing $acl->allow()).
     *
     * If a $privilege is not provided, then this method returns false if and only if the
     * Role is denied access to at least one privilege upon the Resource. In other words, this
     * method returns true if and only if the Role is allowed all privileges on the Resource.
     *
     * This method checks Role inheritance using a depth-first traversal of the Role registry.
     * The highest priority parent (i.e., the parent most recently added) is checked first,
     * and its respective parents are checked similarly before the lower-priority parents of
     * the Role are checked.
     *
     * @param  {RoleInterface|string} role
     * @param  {ResourceInterface|string} resource
     * @param  {string} privilege
     * @return bool
     */

    public isAllowed(
        role: RoleInterface | string = null,
        resource: ResourceInterface | string = null,
        privilege: string = null
    ) {
        // reset role & resource to null
        let allowedRole: RoleInterface = null;
        let allowedResource: ResourceInterface = null;
        // let allowedPrivilege:string = null;
        if (role !== null) {
            allowedRole =
                typeof role === "string"
                    ? this.getRoleRegistry().get(role)
                    : role;
        }
        if (resource !== null) {
            allowedResource =
                typeof resource === "string"
                    ? this.getResource(resource)
                    : resource;
        }
        if (privilege === null) {
            // query on all privileges
            do {
                // depth-first search on $role if it is not 'allRoles' pseudo-parent
                const result = this.roleDFSAllPrivileges(
                    allowedRole,
                    allowedResource
                );
                if (role !== null && result !== null) {
                    return result;
                }
                // look for rule on 'allRoles' pseudo-parent
                const rules = this.getRules(allowedResource, null);
                if (null !== rules) {
                    for (const privilege in rules["byPrivilegeId"]) {
                        const ruleTypeOnePrivilege = this.getRuleType(
                            allowedResource,
                            null,
                            privilege
                        );
                        if (ruleTypeOnePrivilege === TYPE.DENY) {
                            return false;
                        }
                    }
                    const ruleTypeAllPrivileges = this.getRuleType(
                        allowedResource,
                        null,
                        null
                    );
                    if (ruleTypeAllPrivileges !== null) {
                        return ruleTypeAllPrivileges === TYPE.ALLOW;
                    }
                }
                // try next Resource
                allowedResource =
                    this.resources[allowedResource.getResourceId()]["parent"];
            } while (true); // loop terminates at 'allResources' pseudo-parent
        } else {
            // allowedPrivilege = privilege;
            // query on one privilege
            do {
                // depth-first search on $role if it is not 'allRoles' pseudo-parent
                const result: boolean | null = this.roleDFSOnePrivilege(
                    allowedRole,
                    allowedResource,
                    privilege
                );
                if (role !== null && result !== null) {
                    return result;
                }
                // look for rule on 'allRoles' pseudo-parent
                const ruleType: TYPE | null = this.getRuleType(
                    allowedResource,
                    null,
                    privilege
                );
                if (ruleType !== null) {
                    return ruleType === TYPE.ALLOW;
                } else {
                    const ruleTypeAllPrivileges = this.getRuleType(
                        allowedResource,
                        null,
                        null
                    );
                    if (ruleTypeAllPrivileges !== null) {
                        const result = ruleTypeAllPrivileges === TYPE.ALLOW;
                        if (result || null === allowedResource) {
                            return result;
                        }
                    }
                }
                // try next Resource
                allowedResource =
                    this.resources[allowedResource.getResourceId()]["parent"];
            } while (true); // loop terminates at 'allResources' pseudo-parent
        }
    }

    /**
     * Performs a depth-first search of the Role DAG, starting at $role, in order to find a rule
     * allowing/denying $role access to all privileges upon $resource
     *
     * This method returns true if a rule is found and allows access. If a rule exists and denies access,
     * then this method returns false. If no applicable rule is found, then this method returns null.
     *
     * @param  {RoleInterface} role
     * @param  {ResourceInterface} resource
     * @return {bool|null}
     */
    protected roleDFSAllPrivileges(
        role: RoleInterface,
        resource: ResourceInterface = null
    ): boolean | null {
        const dfs: IVisitedStack = {
            visited: [],
            stack: [],
        };
        const result = this.roleDFSVisitAllPrivileges(role, resource, dfs);
        if (result !== null) {
            return result;
        }
        // This comment is needed due to a strange php-cs-fixer bug
        // const keys = Object.keys(dfs);
        // const dfsRole = dfs[keys[keys.length - 1]];
        let dfsRole = dfs.stack.pop();
        /// const role = array_pop(dfs['stack']); !!!!!!!!!!!!!!!!!!!!
        while (dfsRole) {
            if (!dfs["visited"].hasOwnProperty(dfsRole.getRoleId())) {
                const result = this.roleDFSVisitAllPrivileges(
                    dfsRole,
                    resource,
                    dfs
                );
                if (result !== null) {
                    return result;
                }
            }
            dfsRole = dfs.stack.pop();
        }
        return null;
    }

    /**
     * Visits an $role in order to look for a rule allowing/denying $role access to all privileges upon $resource
     *
     * This method returns true if a rule is found and allows access. If a rule exists and denies access,
     * then this method returns false. If no applicable rule is found, then this method returns null.
     *
     * This method is used by the internal depth-first search algorithm and may modify the DFS data structure.
     *
     * @param  {RoleInterface} role
     * @param  {ResourceInterface} resource
     * @param  {array} dfs
     * @return {bool|null}
     * @throws {RuntimeException}
     */
    protected roleDFSVisitAllPrivileges(
        role: RoleInterface,
        resource: ResourceInterface = null,
        dfs: any = null
    ): boolean | null {
        if (dfs === null) {
            throw new Error("dfs parameter may not be null");
        }
        const rules = this.getRules(resource, role);
        if (rules !== null) {
            for (const privilege in rules["byPrivilegeId"]) {
                const ruleTypeOnePrivilege = this.getRuleType(
                    resource,
                    role,
                    privilege
                );
                if (ruleTypeOnePrivilege === TYPE.DENY) {
                    return false;
                }
            }
            const ruleTypeAllPrivileges = this.getRuleType(
                resource,
                role,
                null
            );
            if (ruleTypeAllPrivileges !== null) {
                return ruleTypeAllPrivileges === TYPE.ALLOW;
            }
        }
        dfs["visited"][role.getRoleId()] = true;
        const parents = this.getRoleRegistry().getParents(role);
        for (const roleParent in parents) {
            const rp = parents[roleParent];
            dfs["stack"].push(rp);
        }
        return null;
    }

    /**
     * Performs a depth-first search of the Role DAG, starting at $role, in order to find a rule
     * allowing/denying $role access to a $privilege upon $resource
     *
     * This method returns true if a rule is found and allows access. If a rule exists and denies access,
     * then this method returns false. If no applicable rule is found, then this method returns null.
     *
     * @param  {RoleInterface} role
     * @param  {ResourceInterface} resource
     * @param  {string} privilege
     * @return {boolean|null}
     * @throws {RuntimeException}
     */
    protected roleDFSOnePrivilege(
        role: RoleInterface,
        resource: ResourceInterface = null,
        privilege: string = null
    ): boolean | null {
        if (privilege === null) {
            throw new Error("$privilege parameter may not be null");
        }
        const dfs: IVisitedStack = {
            visited: [],
            stack: [],
        };
        const result = this.roleDFSVisitOnePrivilege(
            role,
            resource,
            privilege,
            dfs
        );
        if (result !== null) {
            return result;
        }
        // This comment is needed due to a strange php-cs-fixer bug
        let dfsRole = dfs.stack.pop();
        while (dfsRole) {
            if (!dfs["visited"].hasOwnProperty(dfsRole.getRoleId())) {
                const result = this.roleDFSVisitOnePrivilege(
                    dfsRole,
                    resource,
                    privilege,
                    dfs
                );
                if (result !== null) {
                    return result;
                }
            }
            dfsRole = dfs.stack.pop();
        }
        return result;
    }

    /**
     * Visits an $role in order to look for a rule allowing/denying $role access to a $privilege upon $resource
     *
     * This method returns true if a rule is found and allows access. If a rule exists and denies access,
     * then this method returns false. If no applicable rule is found, then this method returns null.
     *
     * This method is used by the internal depth-first search algorithm and may modify the DFS data structure.
     *
     * @param  {RoleInterface} role
     * @param  {ResourceInterface} resource
     * @param  {string} privilege
     * @param  {array} dfs
     * @return {bool|null}
     * @throws {RuntimeException}
     */
    protected roleDFSVisitOnePrivilege(
        role: RoleInterface,
        resource: ResourceInterface = null,
        privilege: string = null,
        dfs: any = null
    ): boolean | null {
        if (null === privilege) {
            throw new Error("privilege parameter may not be null");
        }

        if (dfs === null) {
            throw new Error("dfs parameter may not be null");
        }

        const ruleTypeOnePrivilege: TYPE = this.getRuleType(
            resource,
            role,
            privilege
        );
        if (ruleTypeOnePrivilege !== null) {
            return TYPE.ALLOW === ruleTypeOnePrivilege;
        } else {
            const ruleTypeAllPrivileges: TYPE = this.getRuleType(
                resource,
                role,
                null
            );
            if (ruleTypeAllPrivileges !== null) {
                return TYPE.ALLOW === ruleTypeAllPrivileges;
            }
        }
        dfs["visited"][role.getRoleId()] = true;
        const parents = this.getRoleRegistry().getParents(role);
        for (const roleParent in parents) {
            dfs["stack"].push(parents[roleParent]);
        }
        return null;
    }

    /**
     * Returns the rule type associated with the specified Resource, Role, and privilege
     * combination.
     *
     * If a rule does not exist or its attached assertion fails, which means that
     * the rule is not applicable, then this method returns null. Otherwise, the
     * rule type applies and is returned as either TYPE_ALLOW or TYPE_DENY.
     *
     * If $resource or $role is null, then this means that the rule must apply to
     * all Resources or Roles, respectively.
     *
     * If $privilege is null, then the rule must apply to all privileges.
     *
     * If all three parameters are null, then the default ACL rule type is returned,
     * based on whether its assertion method passes.
     *
     * @param  {ResourceInterface} resource
     * @param  {null|RoleInterface} role
     * @param  {null|string} privilege
     * @return {TYPE|null}
     */
    protected getRuleType(
        resource: ResourceInterface = null,
        role: RoleInterface = null,
        privilege: string = null
    ): TYPE | null {
        // get the rules for the $resource and $role
        const rules = this.getRules(resource, role);
        if (rules === null) {
            return null;
        }
        // follow $privilege
        let rule = null;
        if (privilege === null) {
            if (rules.hasOwnProperty("allPrivileges")) {
                rule = rules["allPrivileges"];
            } else {
                return null;
            }
        } else if (!rules["byPrivilegeId"].hasOwnProperty(privilege)) {
            return null;
        } else {
            rule = rules["byPrivilegeId"][privilege];
        }

        return rule["type"];

        // check assertion first
        // if (null !== resource || null !== role || null !== privilege) {
        //     return null;
        // } else if (TYPE.ALLOW === rule['type']) {
        //     return TYPE.DENY;
        // }
        // return TYPE.ALLOW;
    }

    /**
     * Returns the rules associated with a Resource and a Role, or null if no such rules exist
     *
     * If either $resource or $role is null, this means that the rules returned are for all Resources or all Roles,
     * respectively. Both can be null to return the default rule set for all Resources and all Roles.
     *
     * If the $create parameter is true, then a rule set is first created and then returned to the caller.
     *
     * @param  {ResourceInterface} resource
     * @param  {RoleInterface} role
     * @param  {bool} create
     * @return {array|null}
     */
    protected getRules(
        resource: ResourceInterface = null,
        role: RoleInterface = null,
        create = false
    ): any | null {
        let visitor = null;
        do {
            if (resource === null) {
                visitor = this.rules["allResources"];
                break;
            }
            const resourceId = resource.getResourceId();
            if (!this.rules["byResourceId"].hasOwnProperty(resourceId)) {
                if (!create) {
                    return null;
                }
                set(this.rules, `byResourceId.${resourceId}.byRoleId`, {});
            }

            visitor = this.rules["byResourceId"][resourceId];
        } while (false);
        // follow $role
        if (role === null) {
            if (!visitor.hasOwnProperty("allRoles")) {
                if (!create) {
                    return null;
                }
                set(visitor, "allRoles.byPrivilegeId", {});
            }
            return visitor["allRoles"];
        }

        const roleId = role.getRoleId();

        if (visitor === undefined) {
            visitor = { byRoleId: {} };
        }

        if (!visitor["byRoleId"].hasOwnProperty(roleId)) {
            if (!create) {
                return null;
            }
            set(visitor, `byRoleId.${roleId}.byPrivilegeId`, {});
        }
        return visitor["byRoleId"][roleId];
    }

    /**
     * @return {string[]} of registered roles
     */
    public getRoles(): string[] {
        return Object.keys(this.getRoleRegistry().getRoles());
    }

    /**
     * @return {string[]} of registered resources
     */
    public getResources(): string[] {
        return Object.keys(this.resources);
    }
}
// @ts-ignore-end
