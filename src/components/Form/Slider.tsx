import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
interface iSlider {
    included?: boolean;
    step?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    handleChange: (value: number) => void;
    marks?: {[key: number]: string};
}

export default function Slider({
    included = true,
    step = 1,
    defaultValue = 0,
    min = 0,
    max = 100,
    handleChange,
    marks,
}: iSlider) {
    return (
        <>
            <RcSlider
                included={included}
                step={step}
                defaultValue={defaultValue}
                min={min}
                max={max}
                onChange={handleChange}
                marks={marks}
                classNames={{
                    handle: '!bg-indigo-600 !border-0 !opacity-100',
                    rail: '!bg-blue-400',
                }}
                dotStyle={{borderColor: 'rgb(96, 165, 250)'}}
            />
        </>
    );
}
