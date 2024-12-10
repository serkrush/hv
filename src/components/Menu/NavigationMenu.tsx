import { GRANT, IMenu } from "@/acl/types";
import {
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    TableCellsIcon,
    UsersIcon
} from "@heroicons/react/24/outline";

export const TopNavigationMenu: IMenu = {
    "NavigationMenu/Users": {
        grant: GRANT.READ,
        label: "users",
        icon: UsersIcon,
        resources: ["*"],
        url: "/home/users",
    },
    "NavigationMenu/Categories": {
        grant: GRANT.READ,
        label: "categories",
        icon: ClipboardDocumentListIcon,
        resources: ["*"],
        url: "/home/categories",
    },
    "NavigationMenu/Recipes": {
        grant: GRANT.READ,
        label: "recipes",
        icon: ClipboardDocumentListIcon,
        resources: ["*"],
        url: "/home/recipes",
    },
    "NavigationMenu/Presets": {
        grant: GRANT.READ,
        label: "presets",
        icon: ClipboardDocumentListIcon,
        resources: ["*"],
        url: "/home/presets",
    },
    "NavigationMenu/MachinesModels": {
        grant: GRANT.READ,
        label: "machines-models",
        icon: TableCellsIcon,
        resources: ["*"],
        url: "/home/machines-models",
    },
    "NavigationMenu/Machines": {
        grant: GRANT.READ,
        label: "machines",
        icon: TableCellsIcon,
        resources: ["*"],
        url: "/home/machines",
    },
};

export const BottomNavigationMenu: IMenu = {
    "NavigationMenu/Settings": {
        grant: GRANT.READ,
        label: "settings",
        icon: Cog6ToothIcon,
        resources: ["*"],
        url: "/home/settings",
    },
};
