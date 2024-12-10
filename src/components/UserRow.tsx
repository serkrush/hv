import ContainerContext from "@/src/ContainerContext";
import { useActions } from "@/src/hooks/useEntity";
import { useContext } from "react";
import { UserInteractMode } from "./Form/UserForm";

export default function UserRow({ user }) {
    const di = useContext(ContainerContext);
    const t = di.resolve("t");

    return (
        <tr key={user.email}>
            <td
                key={"firstName"}
                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
            >
                {user.firstName}
            </td>
            <td
                key={"lastName"}
                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
            >
                {user.lastName}
            </td>
            {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {user.title}
      </td> */}
            <td
                key={"email"}
                className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
            >
                {user.email}
            </td>
            <td
                key={"role"}
                className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
            >
                {user.role}
            </td>
            <td
                key={"edit"}
                className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0"
            >
                <a
                    href={`users/${user.uid}?mode=edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    {t("edit")}
                    <span className="sr-only">, {user.firstName + " " + user.lastName}</span>
                </a>
            </td>
        </tr>
    );
}
