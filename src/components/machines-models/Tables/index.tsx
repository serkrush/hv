import { DEFAULT_PER_PAGE, Modals } from "@/src/constants";
import { useActions } from "@/src/hooks/useEntity";
import { Actions, FilterType, IFieldList, IPagerParams } from "@/src/pagination/IPagerParams";
import { setFlagger } from "@/store/types/actionTypes";
import router, { useRouter } from "next/router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ConfirmationDialog from "../../ConfirmationDialog";
import AdaptiveTable from "../../AdaptiveTable/Table";
import ImageStore from "../../Form/ImageStore";



export default function MachinesModelsTable() {
    const {t} = useTranslation();
    const router = useRouter();
    const {deleteMachineModel, fetchMachinesModelPage} = useActions('MachineModelEntity');
    const dispatch = useDispatch();

    const fields: IFieldList = {
        mediaResources:{
            label: 'Image',
            sorted: false,
            column: {
                headClassName:
                    'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                itemClassName:
                    'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
                draw: data => {
                    return (
                        <div className="w-[150px]">
                            {data.mediaResources && (
                                <ImageStore
                                    folder={`models/${data?.id}`}
                                    name={`${data.mediaResources}`}
                                />
                            )}
                        </div>
                    );
                },
            },
        },
        model: {
            label: 'Machine Model',
            type: FilterType.Text,
            sorted: true,
            placeholder: 'Model',
            filter: {
                showLabel: true,
                group: 'g1',
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
        machineType: {
            label: 'Machine Type',
            sorted: true,
            column: {
                headClassName:
                    'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                itemClassName:
                    'whitespace-nowrap pl-4 pr-3 first-letter:capitalize text-sm font-medium text-gray-900 sm:pl-6',
            },
        },
        brand: {
            label: 'Brand',
            type: FilterType.Text,
            sorted: true,
            placeholder: 'Brand',
            filter: {
                showLabel: true,
                group: 'g1',
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
        zones: {
            label: 'Zones List',
            sorted: false,
            column: {
                headClassName:
                    'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 max-w-[200px] whitespace-pre-wrap overflow-auto',
                itemClassName:
                    'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-[200px] whitespace-pre-wrap overflow-auto',
                draw: data => {
                    data.zones.map((item, indx) => {})
                    return (
                        <p className="first-letter:capitalize">
                            {data.zones.join(", ")}
                        </p>
                    );
                },
            },
        }
    }

    const onActionClick = useCallback((action: Actions, data: any, pagerParams: IPagerParams) => {
        switch (action) {
        case Actions.Edit:
            router.push('/home/machines-models/' + data.id + '?mode=edit');
            break;
        case Actions.Delete:
            dispatch(setFlagger(Modals.DeleteMachineModel, {...data, pagerName: pagerParams.pageName, actionFetchingPagesName : "fetchMachinesModelPage"}));
            break;
        default:
            break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="bg-white">
            <ConfirmationDialog
                onOkAction={deleteMachineModel}
                title={t('delete-machine-model')}
                flagerKey={Modals.DeleteMachineModel}
            />
            <AdaptiveTable
                fields={fields}
                actionClassName="text-gray-500 bg-opacity-50 py-1.5 ring-inset ring-gray-300"
                bodyClassName="divide-y divide-gray-200 bg-white"
                className="overflow-hidden bg-gray-100 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"
                actions={[Actions.Edit, Actions.Delete]}
                pagerName={'models'}
                perPage={DEFAULT_PER_PAGE}
                onLoadMore={fetchMachinesModelPage}
                onActionClick={onActionClick}
                loaderEntities={"machines-models"}
            />
        </div>
    );
}