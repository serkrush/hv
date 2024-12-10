import { Oval } from "react-loader-spinner";

export default function LoadingOverlay({ active }) {
    return (
        <div
            className=" fixed left-0 top-0 z-100 h-full w-full content-center items-center justify-center bg-black bg-opacity-60"
            hidden={!active}
        >
            <div className="h-full">
                <div className=" h-1/2"></div>
                <Oval
                    visible={true}
                    height="80"
                    width="80"
                    color="gray"
                    secondaryColor="white"
                    ariaLabel="oval-loading"
                    wrapperStyle={{
                        justifyContent: "center",
                        verticalAlign: "center",
                    }}
                    wrapperClass=""
                />
            </div>
        </div>
    );
}
