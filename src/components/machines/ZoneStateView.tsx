import { AppState, ICycleState, MeasurementSystem, scaledValueMap, ZoneAvailableState } from "@/src/constants";
import { toHHMM } from "@/src/utils/toHHMM";
import { useTranslation } from "react-i18next";
import { FaClock, FaFanSpeed, FaHeating, FaTemperature, FaWeight } from "../FaIcons/icons";
import { useMemo } from "react";
import ZoneLabel from "./ZoneLabel";
import BitSet from "bitset";
import { capitalize } from "@/src/utils/capitalizeEachWord";
import { useSelector } from "react-redux";
import { temperatureConvert } from "@/src/utils/temperatureConverter";
import { weightConvert } from "@/src/utils/weightConverter";

interface IZoneStateViewProps {
    cycleState?: ICycleState;
    zoneName: string;
}


export default function ZoneStateView({cycleState, zoneName}:IZoneStateViewProps) {
    const metric = useSelector((state: AppState) => state?.auth?.identity?.scale ?? MeasurementSystem.Metric)
    const weightFeatureEnabled = true;

    const isActive =
    cycleState != undefined
        ? new BitSet(cycleState?.mode).get(0) > 0
        : false;

    const {t} = useTranslation();

    const valueParagraph = (
        icon: JSX.Element,
        value: string,
        isActive: boolean = true,
        additionalText: string | undefined = undefined,
    ) => {
        return (
            <p className="flex items-center text-size-ll leading-none gap-[0.375rem]">
                {icon}
                <span className={`${isActive ? '' : ' text-[#0A4C5E]/35'}`}>
                    {value}
                    {additionalText != undefined && (
                        <span className="text-size-sb font-normal">
                            {additionalText}
                        </span>
                    )}
                </span>
            </p>
        );
    };

    let degreeString = '';
    const degreeStringValue =
        metric != undefined ? scaledValueMap.temperature[metric] : 'C';
    if (degreeStringValue) {
        degreeString = `°${degreeStringValue}`;
    }
    let degreeValue = cycleState?.state?.exitTemperature ?? 0;
    degreeValue = Math.round(
        metric == MeasurementSystem.Imperial
            ? temperatureConvert(degreeValue, true)
            : degreeValue,
    );

    const weightString =
        metric != undefined ? scaledValueMap.weight[metric] : '';
        
    let weight =
        cycleState?.state?.weight != undefined && cycleState?.state?.weight != null
            ? cycleState?.state?.weight
            : 0;

    const weightValue =
        metric == MeasurementSystem.Imperial
            ? weightConvert(weight / 1000, true).toFixed(1)
            : (weight / 1000).toFixed(1);

    const titleParagraph = (title: string, isActive: boolean = true) => {
        return (
            <p
                className={`text-size-xs mb-[0.625rem] ${isActive ? '' : ' text-[#0A4C5E]/35'}`}
            >
                {title}
            </p>
        );
    };

    const stageIndexSpan = (
        index: number,
        isSelected: boolean,
        isActive: boolean = true,
    ) => {
        return (
            <span
                key={index}
                className={`font-medium font-inter text-[0.9375rem] leading-none border w-[1.25rem] h-[1.25rem] py-[0.1rem] px-[0.3rem] ${isSelected ? 'bg-[#0A4C5E] text-white' : ''} ${isActive ? '' : 'bg-lightGray text-[#5E675A40] border-[#5E675A40]'} `}
            >
                {index + 1}
            </span>
        );
    };

    return <div className="w-full text-gray-900 border bg-[#CBD4DB]/50 rounded-md">
        <div className="flex items-center justify-center gap-2 bg-[#CBD4DB]/70 text-gray-900/80 border-b py-1">
            <h3 className="text-base font-semibold">
                {t('zone') + " " + capitalize(zoneName)}
            </h3>
            <div className="">
                <ZoneLabel
                    state={
                        cycleState ? isActive
                            ? ZoneAvailableState.InProgress
                            : ZoneAvailableState.Available : ZoneAvailableState.Offline
                    }
                />
                <ZoneLabel itemMode={cycleState?.mode} />
            </div>
        </div>
        <div
            className={`grid grid-cols-3 w-full text-[#0A4C5E] gap-y-2 p-1`}
        >
            <div className="">
                {titleParagraph(
                    t('stages'),
                    isActive
                )}
                <div className="flex flex-wrap gap-[0.3125rem]">
                    {cycleState?.params.length ? (
                        <>
                            {cycleState?.params.map((item, indx) =>
                                stageIndexSpan(
                                    indx,
                                    isActive &&
                                    cycleState?.stage - 1 == indx,
                                    cycleState?.params != undefined &&
                                    cycleState?.params?.length > 0 &&
                                            isActive,
                                ),
                            )}
                        </>
                    ) : (
                        <>{stageIndexSpan(-1, false, false)}</>
                    )}
                </div>
            </div>
            <div>
                {titleParagraph(t('temperature-label'),!!cycleState)}
                {valueParagraph(
                    <FaTemperature className="w-4 h-4" color={!!cycleState ? undefined : '#CBD4D4'}/>,
                    degreeValue + degreeString,
                    !!cycleState
                )}
            </div>
            <div>
                {titleParagraph(t('total-time'), isActive)}
                {valueParagraph(
                    <FaClock
                        className="w-4 h-4"
                        color={isActive ? undefined : '#CBD4D4'}
                    />,
                    toHHMM(cycleState?.total ?? 0),
                    isActive,
                )}
            </div>
            {weightFeatureEnabled && (
                <div>
                    {titleParagraph(t('weight'), isActive)}
                    {valueParagraph(
                        <FaWeight
                            className="w-4 h-4"
                            color={isActive ? undefined : '#CBD4D4'}
                        />,
                        weightValue,
                        isActive,
                        weightString,
                    )}
                </div>
            )}
            <div>
                {titleParagraph(t('fan-speed', {number: 1}), isActive)}
                {valueParagraph(
                    <FaFanSpeed
                        className="w-4 h-4"
                        color={isActive ? undefined : '#CBD4D4'}
                    />,
                    `${cycleState?.state.fanPerformance1 ?? 0}%`,
                    isActive,
                )}
            </div>
            <div>
                {titleParagraph(t('heating-intensity'), isActive)}
                {valueParagraph(
                    <FaHeating
                        className="w-4 h-4"
                        color={isActive ? undefined : '#CBD4D4'}
                    />,
                    `${cycleState?.state.heatingIntensity ?? 0}%`,
                    isActive,
                )}
            </div>
        </div>
    </div>
}