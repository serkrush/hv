import { IMachine, ZoneAvailableState } from "@/server/models/Machine";
import { formatDateTime } from "@/server/utils/formatDateTime";
import { AppState, DEFAULT_PER_PAGE, ENTITY, SHORT_GUID_LENGTH } from "@/src/constants";
import { useActions } from "@/src/hooks/useEntity";
import { Actions, FilterType, IFieldList, IPagerParams } from "@/src/pagination/IPagerParams";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import AdaptiveTable from "../../AdaptiveTable/Table";
import InsetSpinner from "../../InsetSpinner";

export default function MachinesTable() {
    const {fetchMachinesPage} = useActions('MachineEntity');
    const router = useRouter();
    const users = useSelector((state: AppState) => state[ENTITY.USERS]);

    const fields: IFieldList = useMemo(() => {
        return {
            guid: {
                label: 'machine-id',
                type: FilterType.Text,
                placeholder: 'machine-id',
                filter: {
                    showLabel: true,
                    group: 'a1',
                    className: 'text-gray-900 ',
                    inputClassName:
                        'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                },
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
                    draw: data => <>{data?.guid?.slice(SHORT_GUID_LENGTH).toUpperCase() ?? 0}</>
                },
            },
            modelId: {
                label: 'machine-model',
                type: FilterType.Text,
                placeholder: 'machine-model',
                filter: {
                    showLabel: true,
                    group: 'a1',
                    className: 'text-gray-900 ',
                    inputClassName:
                        'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                },
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
                },
            },
            ownerName: {
                label: 'owner-name',
                placeholder: 'last-name',
                filter: {
                    customLabel:  'last-name',
                    showLabel: true,
                    group: 'a1',
                    className: 'text-gray-900 ',
                    inputClassName:
                        'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                },
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
                    draw: (data: IMachine) => {
                        if(data?.ownerId) {
                            const firstName = users[data?.ownerId]?.firstName ?? ""
                            const lastName = users[data?.ownerId]?.lastName ?? ""
                            return <>{firstName} {lastName}</>
                        }
                    }
                },
            },
            zones: {
                label: 'amount-of-zones',
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 first-letter:capitalize text-sm font-medium text-gray-900 sm:pl-6',
                    draw: data => (<p>{data?.zones?.length ?? 0}</p>)
                },
            },
            status: {
                label: 'status',
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 first-letter:capitalize text-sm font-medium text-gray-900 sm:pl-6',
                    draw: data => (<p>{ZoneAvailableState.Offline}</p>)
                },
            },
            createdAt: {
                label: 'pair-date',
                column: {
                    headClassName:
                        'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                    itemClassName:
                        'whitespace-nowrap pl-4 pr-3 first-letter:capitalize text-sm font-medium text-gray-900 sm:pl-6',
                    draw: (data:IMachine) => (<p>{formatDateTime(data?.createdAt ?? 0)}</p>)
                },
            },
        }
    }, [users])

    const onActionClick = useCallback((action: Actions, data: any, pagerParams: IPagerParams) => {
        switch (action) {
        case Actions.View:
            router.push('/home/machines/' + data.id);
            break;
        default:
            break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="bg-white relative">
            <AdaptiveTable
                fields={fields}
                actionClassName="text-gray-500 bg-opacity-50 py-1.5 ring-inset ring-gray-300"
                bodyClassName="divide-y divide-gray-200 bg-white"
                className="overflow-hidden bg-gray-100 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"
                actions={[Actions.View]}
                pagerName={'machines'}
                perPage={DEFAULT_PER_PAGE}
                onLoadMore={fetchMachinesPage}
                onActionClick={onActionClick}
                loaderEntities={"machines"}
            />
        </div>
    );
}