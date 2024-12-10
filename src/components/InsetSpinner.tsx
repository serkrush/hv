import { FaSpinner } from "./FaIcons/icons";
import LoadingOverlay from "./loaderOverlay";
import SpinnerBase, { CheckType } from "./SpinnerBase";

interface SpinnerProps {
    checkEntities: CheckType | CheckType[];
}

export default function InsetSpinner({ checkEntities }: SpinnerProps) {
    return (
        <SpinnerBase checkEntities={checkEntities}>
            <div className="absolute inset-0 z-20 flex items-start pt-[1rem] justify-center bg-white/50 rounded-lg">
                <FaSpinner className="animate-spin w-[2rem] h-[2rem] fill-gray-500" />
            </div>
        </SpinnerBase>
        
    );
}
