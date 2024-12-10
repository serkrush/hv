import { IMenuData } from "@/acl/types";
import Link from "next/link";
import { ILinkHrefAs } from "./MultiLevelMenu";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setFlagger } from "@/store/types/actionTypes";
import { AppState, Flag } from "@/src/constants";
import { classNames } from "@/src/utils/classNames";


export interface IMenuItemProps {
    menuItem: IMenuData;
    dataKey: string;
    getLinkHrefAs: (item: IMenuData) => ILinkHrefAs;
}

export default function MenuItem({
    menuItem,
    dataKey,
    getLinkHrefAs,
}: IMenuItemProps) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const linkHrefAs = getLinkHrefAs(menuItem);
    const isCurrent = useSelector((state: AppState) => {
        return state.flagger[Flag.SelectedNavOption] == dataKey;
    });
    return (
        <Link
            onClick={() => {
                dispatch(setFlagger(Flag.SelectedNavOption, dataKey));
            }}
            className={classNames(
                isCurrent
                    ? "bg-gray-500/20 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-500/20 hover:text-indigo-600",
                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
            )}
            href={linkHrefAs.href}
            as={linkHrefAs.as}
        >
            <menuItem.icon
                className={classNames(
                    isCurrent
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-indigo-600",
                    "h-6 w-6 shrink-0"
                )}
                aria-hidden="true"
            />
            {t(menuItem.label)}
        </Link>
    );
}
