import RoleInterface from "./RoleInterface";

export default class GenericRole implements RoleInterface {
    /**
     * Unique id of Role
     */
    protected roleId: string;

    /**
     * Sets the Role identifier
     *
     * @param string roleId
     */
    constructor(roleId: string) {
        this.roleId = roleId;
    }

    /**
     * Defined by RoleInterface; returns the Role identifier
     *
     * @return string
     */
    getRoleId() {
        return this.roleId;
    }

    /**
     * Defined by RoleInterface; returns the Role identifier
     * Proxies to getRoleId()
     *
     * @return string
     */
    public toString = (): string => {
        return this.getRoleId();
    };
}
