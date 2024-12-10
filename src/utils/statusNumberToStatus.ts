import { ZoneAdditionalStatus } from "../constants";
import BitSet from 'bitset';

export const statusNumberToStatus = (
    cycleMode: number,
): ZoneAdditionalStatus => {
    const cycleIsActive =
        cycleMode != undefined ? new BitSet(cycleMode).get(0) != 0 : false;
    const cycleIsPaused =
        cycleMode != undefined ? new BitSet(cycleMode).get(1) != 0 : false;
    const cycleIsCooling =
        cycleMode != undefined ? new BitSet(cycleMode).get(2) != 0 : false;
    const cycleIsSanitization =
        cycleMode != undefined ? new BitSet(cycleMode).get(3) != 0 : false;

    let additionalStatus = ZoneAdditionalStatus.None;
    if (!cycleIsActive) {
        additionalStatus = ZoneAdditionalStatus.Idle;
    }

    if (cycleIsPaused) {
        additionalStatus = ZoneAdditionalStatus.Paused;
    } else if (cycleIsCooling) {
        additionalStatus = ZoneAdditionalStatus.Cooling;
    } else if (cycleIsSanitization) {
        additionalStatus = ZoneAdditionalStatus.Cleaning;
    }

    return additionalStatus;
};