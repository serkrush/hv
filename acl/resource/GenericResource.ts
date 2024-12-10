import ResourceInterface from "./ResourceInterface";

export default class GenericResource implements ResourceInterface {
    /**
     * Unique id of Resource
     */
    protected resourceId: string;

    /**
     * Sets the Resource identifier
     */
    constructor(resourceId: string) {
        this.resourceId = resourceId;
    }

    /**
     * Defined by ResourceInterface; returns the Resource identifier
     */
    public getResourceId(): string {
        return this.resourceId;
    }

    /**
     * Defined by ResourceInterface; returns the Resource identifier
     * Proxies to getResourceId()
     */
    public toString = (): string => {
        return this.getResourceId();
    };
}
