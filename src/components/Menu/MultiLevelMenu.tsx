import { IMenu, IMenuData } from "@/acl/types";
import { useAcl } from "@/src/hooks/useAcl";
import { useCallback, useMemo } from "react";
import MultiLevelMenuItem from "./MultiLevelMenuItem";

export interface IMultiLevelMenuProps {
    menu: IMenu;
    className: string;
}

export interface ILinkHrefAs {
    href: string;
    as: string;
}

export default function MultiLevelMenu(props: IMultiLevelMenuProps) {
    const { menu, className } = props;
    const { allow } = useAcl();

    const getLinkHrefAs = useCallback((item: IMenuData): ILinkHrefAs => {
        const url = item.url;

        let hrefAndAs: ILinkHrefAs = { href: url, as: url };
        if (item.items) {
            hrefAndAs = { href: null, as: null };
        }

        return hrefAndAs;
    }, []);

    const RenderMenu = useMemo(() => {
        return (
            menu &&
            Object.keys(menu)
                .filter((key) => {
                    const i: IMenuData = menu[key];
                    const isAllowed = allow(i.grant, key);
                    return isAllowed;
                })
                .map((k) => {
                    const item: IMenuData = menu[k];
                    return (
                        <MultiLevelMenuItem
                            getLinkHrefAs={getLinkHrefAs}
                            key={k}
                            dataKey={k}
                            menuItem={item}
                        />
                    );
                })
        );
    }, [allow, getLinkHrefAs, menu]);

    return (
        <div className={`${className ? className : ""} w-full`}>
            {RenderMenu}
        </div>
    );
}
