import { useSelector } from "react-redux";
import { AppState, RequestStatus } from "@/src/constants";
import { useEffect, useState } from "react";
import { IEntityContainer } from "@/src/entities";

export type CheckType = keyof IEntityContainer | string;
export interface SpinnerProps {
    checkEntities: CheckType | CheckType[];
    children;
}

export default function SpinnerBase({ checkEntities, children }: SpinnerProps) {
    const [active, setActive] = useState(false);
    const statuses = useSelector((state: AppState) => {
        return state.requestStatus;
    });

    useEffect(() => {
        let res = false;
        const keys = Object.keys(statuses);
        if (Array.isArray(checkEntities)) {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (
                    key &&
                    checkEntities.includes(key as CheckType) &&
                    statuses[key]?.status == RequestStatus.LOADING
                ) {
                    res = true;
                    break;
                }
            }
        } else {
            res =
                keys.includes(checkEntities) &&
                statuses[checkEntities]?.status == RequestStatus.LOADING;
        }
        setActive(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statuses]);

    return <div>{active && children}</div>;
}
