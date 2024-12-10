import { ChevronDownIcon } from "@heroicons/react/20/solid";
import UserRow from "./UserRow";
import { DEFAULT_SORT_DIR, DEFAULT_SORT_FIELD } from "@/src/constants";
import { useContext } from "react";
import ContainerContext from "@/src/ContainerContext";

export default function UserTable({
    users,
    onAddUser,
    currentSort = DEFAULT_SORT_FIELD,
    currentSortDir = DEFAULT_SORT_DIR,
}) {
    const di = useContext(ContainerContext);
    const t = di.resolve("t");

    const changeSort = (field) => {
        let resS = currentSort;
        let resD = currentSortDir;
        if (currentSort === field) {
            resD = currentSortDir === "desc" ? "asc" : "desc";
        } else {
            resS = field;
            resD = "asc";
        }
        return `?s=${resS}&sd=${resD}`;
    };

    return (
        <div className=" bg-white">
            <div className="flex justify-end border-b-2 bg-white px-3 py-1">
                <div className=" ">
                    <div />
                </div>
                <div className=" bg-white">
                    <button
                        onClick={onAddUser}
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {t("add-user")}
                    </button>
                </div>
            </div>
            <div className="flow-root px-4 sm:px-6 lg:px-8">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full table-fixed divide-y divide-gray-300">
                            <thead className="">
                                <tr>
                                    <th
                                        key={"firstName"}
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                    >
                                        <a
                                            href={`${changeSort("firstName")}`}
                                            className="group inline-flex"
                                        >
                                            {t("user-first-name-title")}
                                            <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                                <ChevronDownIcon
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        key={"lastName"}
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                    >
                                        <a
                                            href={`${changeSort("lastName")}`}
                                            className="group inline-flex"
                                        >
                                            {t("user-last-name-title")}
                                            <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                                <ChevronDownIcon
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        key={"email"}
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        <a
                                            href={`${changeSort("email")}`}
                                            className="group inline-flex"
                                        >
                                            {t("user-email-title")}
                                            <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                                <ChevronDownIcon
                                                    className="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        key={"role"}
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        <a
                                            href={`${changeSort("role")}`}
                                            className="group inline-flex"
                                        >
                                            {t("user-role-title")}
                                            <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                                <ChevronDownIcon
                                                    className="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </a>
                                    </th>
                                    <th
                                        scope="col"
                                        className="relative py-3.5 pl-3 pr-0"
                                    >
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user) => {
                                    return (
                                        <UserRow key={user.email} user={user} />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
