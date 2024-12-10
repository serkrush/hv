import { IMenuData } from "@/acl/types";
import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import MenuItem, { IMenuItemProps } from "./MenuItem";
import { useTranslation } from "react-i18next";
import { useAcl } from "@/src/hooks/useAcl";
import { useSelector } from "react-redux";
import { AppState, Flag } from "@/src/constants";
import { classNames } from "@/src/utils/classNames";

export default function MultiLevelMenuItem({
    menuItem,
    dataKey,
    getLinkHrefAs,
}: IMenuItemProps) {
    const { t } = useTranslation();
    const { allow } = useAcl();
    const isCurrent = useSelector((state: AppState) => {
        const value = state.flagger[Flag.SelectedNavOption] as string;
        return value ? value.startsWith(dataKey) : false;
    });
    return (
        <li key={dataKey}>
            {!menuItem.items ? (
                <MenuItem
                    menuItem={menuItem}
                    dataKey={dataKey}
                    getLinkHrefAs={getLinkHrefAs}
                />
            ) : (
                <Disclosure defaultOpen={isCurrent} as="div">
                    {({ open }) => (
                        <>
                            <Disclosure.Button
                                className={classNames(
                                    isCurrent
                                        ? "bg-gray-50"
                                        : "hover:bg-gray-50",
                                    "flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700"
                                )}
                            >
                                <menuItem.icon
                                    className="h-6 w-6 shrink-0 text-gray-400"
                                    aria-hidden="true"
                                />
                                {t(menuItem.label)}
                                <ChevronRightIcon
                                    className={classNames(
                                        open
                                            ? "rotate-90 text-gray-500"
                                            : "text-gray-400",
                                        "ml-auto h-5 w-5 shrink-0"
                                    )}
                                    aria-hidden="true"
                                />
                            </Disclosure.Button>
                            <Disclosure.Panel as="ul" className="mt-1 px-2">
                                {menuItem.items &&
                                    Object.keys(menuItem.items)
                                        .filter((key) => {
                                            const i: IMenuData =
                                                menuItem.items[key];
                                            const isAllowed = allow(
                                                i.grant,
                                                key
                                            );
                                            return isAllowed;
                                        })
                                        .map((k) => {
                                            const item: IMenuData =
                                                menuItem.items[k];
                                            return (
                                                <MultiLevelMenuItem
                                                    getLinkHrefAs={
                                                        getLinkHrefAs
                                                    }
                                                    key={k}
                                                    dataKey={k}
                                                    menuItem={item}
                                                />
                                            );
                                        })}
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            )}
        </li>
    );
}
