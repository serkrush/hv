import "reflect-metadata";
import { BaseEntity } from "src/entities/BaseEntity";

export default function alias(name: string) {
    return (constructor: Function) => {
        ["sagas", "pushes"].forEach((groupName) => {
            const events: any =
                Reflect.getMetadata(groupName, BaseEntity) || [];
            events
                .filter((e) => e.className === constructor.name)
                .forEach((e) => {
                    e.className = name;
                });
            Reflect.defineMetadata(groupName, events, BaseEntity);
        });
    };
}
