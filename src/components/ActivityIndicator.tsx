import LoaderCircle from "./LoaderCircle";
import SpinnerBase, { CheckType } from "./SpinnerBase";

interface SpinnerProps {
    checkEntities: CheckType | CheckType[];
    size?: number;
    color?;
    secondaryColor?;
}

export default function ActivityIndicator({
    checkEntities,
    size = 80,
    color = "white",
    secondaryColor = "gray",
}: SpinnerProps) {
    return (
        <SpinnerBase checkEntities={checkEntities}>
            <LoaderCircle
                size={size}
                color={color}
                secondaryColor={secondaryColor}
            />
        </SpinnerBase>
    );
}
