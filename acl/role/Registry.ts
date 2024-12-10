const set = require("set-value");

import RoleInterface from "./RoleInterface";

export default class Registry {
    protected roles: any;

    constructor() {
        this.roles = {};
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
     * @param  RoleInterface              role
     * @param  RoleInterface|string|array parents
     * @throws Exception\InvalidArgumentException
     * @return Registry Provides a fluent interface
     */
    public add(
        role: RoleInterface,
        parents:
            | RoleInterface
            | string
            | RoleInterface[]
            | string[]
            | null = null
    ) {
        const roleId = role.getRoleId();
        if (this.has(roleId)) {
            throw new Error(`Role id ${roleId} already exists in the registry`);
        }

        const roleParents: any = [];
        if (parents !== null) {
            const ps = Array.isArray(parents) ? parents : [parents];
            for (let i = 0, size = ps.length; i < size; i++) {
                const roleParentId: any = null;
                try {
                    const psi = ps[i];
                    let roleParentId: string = psi.toString();
                    if (typeof psi !== "string" && psi.getRoleId) {
                        roleParentId = psi.getRoleId();
                    }
                    const roleParent = this.get(roleParentId);
                    roleParents[roleParentId] = roleParent;
                    set(this.roles, `${roleParentId}.children.${roleId}`, role);
                } catch (e) {
                    throw new Error(
                        `Parent Role id ${roleParentId} does not exist`
                    );
                }
            }
        }

        this.roles[roleId] = {
            instance: role,
            parents: roleParents,
            children: [],
        };
    }

    /**
     * Returns the identified Role
     *
     * The $role parameter can either be a Role or a Role identifier.
     *
     * @param  RoleInterface|string $role
     * @return RoleInterface
     */
    public get(role: any): RoleInterface {
        let roleId: string = role;
        if (role.getRoleId) {
            roleId = role.getRoleId();
        }
        if (!this.has(role)) {
            throw new Error(`Role ${roleId} not found`);
        }
        return this.roles[roleId]["instance"];
    }

    /**
     * Returns true if and only if the Role exists in the registry
     *
     * The $role parameter can either be a Role or a Role identifier.
     *
     * @param  RoleInterface|string role
     * @return bool
     */
    public has(role: RoleInterface | string): boolean {
        let roleId: string = role.toString();
        if (typeof role !== "string" && role.getRoleId) {
            roleId = role.getRoleId();
        }
        return this.roles.hasOwnProperty(roleId);
    }

    /**
     * Returns an array of an existing Role's parents
     *
     * The array keys are the identifiers of the parent Roles, and the values are
     * the parent Role instances. The parent Roles are ordered in this array by
     * ascending priority. The highest priority parent Role, last in the array,
     * corresponds with the parent Role most recently added.
     *
     * If the Role does not have any parents, then an empty array is returned.
     *
     * @param  {RoleInterface|string} role
     * @return {array}
     */
    public getParents(role: RoleInterface | string): RoleInterface {
        const roleId = this.get(role).getRoleId();
        return this.roles[roleId]["parents"];
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
     * @param  {RoleInterface|string}  role
     * @param  {RoleInterface|string}  inherit
     * @param  {bool}                  onlyParents
     * @throws {InvalidArgumentException}
     * @return {bool}
     */
    public inherits(
        role: RoleInterface | string,
        inherit: RoleInterface | string,
        onlyParents: boolean = false
    ): boolean {
        try {
            const roleId = this.get(role).getRoleId();
            const inheritId = this.get(inherit).getRoleId();
            const inherits =
                this.roles[roleId]["parents"].hasOwnProperty(inheritId);
            if (inherits || onlyParents) {
                return inherits;
            }
            for (const parentId in this.roles[roleId]["parents"]) {
                if (this.inherits(parentId, inheritId)) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            throw new Error("InvalidArgumentException: " + e);
        }
    }

    /**
     * Removes the Role from the registry
     *
     * The $role parameter can either be a Role or a Role identifier.
     *
     * @param  {RoleInterface|string} role
     * @throws {InvalidArgumentException}
     * @return {Registry} Provides a fluent interface
     */
    public remove(role: RoleInterface | string): Registry {
        try {
            const roleId = this.get(role).getRoleId();
            for (const childId in this.roles[roleId]["children"]) {
                delete this.roles[childId]["parents"][roleId];
            }
            for (const parentId in this.roles[roleId]["parents"]) {
                delete this.roles[parentId]["children"][roleId];
            }
            delete this.roles[roleId];
        } catch (e) {
            throw new Error("InvalidArgumentException: " + e);
        }

        return this;
    }

    /**
     * Removes all Roles from the registry
     *
     * @return {Registry} Provides a fluent interface
     */
    public removeAll(): Registry {
        this.roles = {};
        return this;
    }

    /**
     * Get all roles in the registry
     *
     * @return array
     */
    public getRoles() {
        return this.roles;
    }
}
