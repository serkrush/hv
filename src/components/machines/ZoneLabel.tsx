import { capitalizeEachWord } from '@/src/utils/capitalizeEachWord';
import { statusNumberToStatus } from '@/src/utils/statusNumberToStatus';
import { useTranslation } from 'react-i18next';
import { ZoneAdditionalStatus, ZoneAvailableState } from 'src/constants';

const styles = {
    [ZoneAvailableState.Available]: "bg-[#F0FFEE] border-[#C7F9AF] text-[#28B446]",
    [ZoneAvailableState.InProgress]: "bg-[#F0FFEE] border-[#C7F9AF] text-[#28B446]",
    [ZoneAvailableState.Offline]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#959595]",
    [ZoneAvailableState.Error]: "bg-[#FFEEEE] border-[#F9AFAF] text-[#ED2424]",
    [ZoneAvailableState.Scheduled]: "bg-[#FFF6EE] border-[#F9DBAF] text-[#ED8A24]",

    [ZoneAdditionalStatus.None]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#354054]",
    [ZoneAdditionalStatus.Idle]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#354054]",
    [ZoneAdditionalStatus.Paused]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#354054]",
    [ZoneAdditionalStatus.Cooling]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#354054]",
    [ZoneAdditionalStatus.Cleaning]: "bg-[#F9FAFB] border-[#E3E3E3] text-[#354054]",
};

export default function ZoneLabel({
    state,
    itemMode,
}: {
    state?: ZoneAvailableState;
    itemMode?: number;
}) {
    const { t } = useTranslation();
    let currentStyles:string = '';
    let text = '';
    if (state != undefined) {
        text = capitalizeEachWord(t(state));
        currentStyles = styles[state];
    } else if (itemMode != undefined) {
        const status = statusNumberToStatus(itemMode);
        if (status == ZoneAdditionalStatus.None) {
            return <></>;
        }
        currentStyles = styles[status];
        text = capitalizeEachWord(t(status));
    } else {
        return <></>;
    }
    return (
        <>
            <span
                className={`font-medium text-[0.75rem] ${currentStyles} border px-2 py-1 rounded-[2.25rem] xl:text-base`}
            >
                {text}
            </span>
        </>
    );
}
