import { BaseEntity } from "./BaseEntity";
import reducer from "./decorators/reducer";
import alias from "./decorators/alias";
import { ENTITY } from "../constants";

@alias("CycleEntity")
@reducer(ENTITY.CYCLES)
export default class CycleEntity extends BaseEntity<CycleEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema(ENTITY.CYCLES, {}, {});
    }
}
