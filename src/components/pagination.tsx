import ContainerContext from "@/src/ContainerContext";
import { useContext } from "react";

export default function Pagination({
    previousActive,
    nextActive,
    onNext,
    onPrevious,
    count,
    currentCount,
    page,
    perPage,
}) {
    const di = useContext(ContainerContext);
    const t = di.resolve("t");
    const start = (page - 1) * perPage;
    return (
        <nav
            className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
            aria-label="Pagination"
        >
            <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                    {t("page-showing")}{" "}
                    <span className="font-medium">{start + 1}</span>{" "}
                    {t("page-to")}{" "}
                    <span className="font-medium">{start + currentCount}</span>{" "}
                    {t("page-of")} <span className="font-medium">{count}</span>{" "}
                    {t("page-results")}
                </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
                <button
                    disabled={!previousActive}
                    onClick={onPrevious}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                >
                    {t("page-previous")}
                </button>
                <button
                    disabled={!nextActive}
                    onClick={onNext}
                    className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                >
                    {t("page-next")}
                </button>
            </div>
        </nav>
    );
}
