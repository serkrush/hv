import { Oval } from "react-loader-spinner";

export default function LoaderCircle({
    size = 80,
    color = "gray",
    secondaryColor = "white",
}) {
    return (
        <Oval
            visible={true}
            height={size}
            width={size}
            color={color}
            secondaryColor={secondaryColor}
            ariaLabel="oval-loading"
            wrapperStyle={{
                justifyContent: "center",
                verticalAlign: "center",
            }}
            wrapperClass=""
        />
    );
}
