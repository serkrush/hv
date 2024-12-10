import LoadingOverlay from "./loaderOverlay";
import SpinnerBase, { CheckType } from "./SpinnerBase";

interface SpinnerProps {
    checkEntities: CheckType | CheckType[];
}

export default function SpinnerLoaderOverlay({ checkEntities }: SpinnerProps) {
    return (
        <SpinnerBase checkEntities={checkEntities}>
            <LoadingOverlay active={true} />
        </SpinnerBase>
    );
}
