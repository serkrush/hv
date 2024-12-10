import {DEFAULT_PER_PAGE, Modals} from '@/src/constants';
import {useTranslation} from 'react-i18next';
import AdaptiveTable from '../../AdaptiveTable/Table';
import {
    Actions,
    FilterType,
    IFieldList,
    IPagerParams,
} from '@/src/pagination/IPagerParams';
import ImageStore from '../../Form/ImageStore';
import {useCallback} from 'react';
import {setFlagger} from '@/store/types/actionTypes';
import {useDispatch} from 'react-redux';
import {useRouter} from 'next/router';
import {useActions} from '@/src/hooks/useEntity';
import ConfirmationDialog from '../../ConfirmationDialog';

export default function PresetTable({onAdd}) {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const router = useRouter();
    const {fetchPresetsPage, deleteRecipe} = useActions('RecipeEntity');

    const fields: IFieldList = {
        media_resources: {
            label: 'image',
            sorted: false,
            column: {
                headClassName:
                    'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6',
                itemClassName:
                    'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
                draw: data => {
                    return (
                        <div className="w-[150px]">
                            {data.media_resources &&
                                data.media_resources.length > 0 && (
                                <ImageStore
                                    folder={`recipes/${data?.id}`}
                                    name={`${data.media_resources[0]}`}
                                />
                            )}
                        </div>
                    );
                },
            },
        },
        recipe_name: {
            label: 'recipe-name',
            type: FilterType.Text,
            sorted: true,
            placeholder: 'Full Name',
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
        description: {
            label: 'description',
            sorted: false,
            column: {
                headClassName:
                    'bg-gray-50 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 max-w-[200px] whitespace-pre-wrap overflow-auto',
                itemClassName:
                    'whitespace-nowrap pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-[200px] whitespace-pre-wrap overflow-auto',
                draw: data => {
                    return (
                        <p>
                            {data?.description?.length > 150
                                ? `${data.description.slice(0, 150)}...`
                                : data.description}
                        </p>
                    );
                },
            },
        },
    };

    const onActionClick = useCallback(
        (action: Actions, data: any, pagerParams: IPagerParams) => {
            switch (action) {
            case Actions.Edit:
                router.push('/home/presets/' + data.id + '?mode=edit');
                break;
            case Actions.Delete:
                dispatch(setFlagger(Modals.DeleteRecipe, {...data, pagerName: pagerParams.pageName, actionFetchingPagesName : "fetchPresetsPage"}));
                break;
            default:
                break;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <div className=" bg-white">
            <ConfirmationDialog
                onOkAction={deleteRecipe}
                title={t('delete-recipe')}
                flagerKey={Modals.DeleteRecipe}
            />
            <div className="flex justify-end border-b-2 bg-white px-3 py-1">
                <div className=" bg-white">
                    <button
                        onClick={onAdd}
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {t('add-preset')}
                    </button>
                </div>
            </div>

            <AdaptiveTable
                fields={fields}
                actionClassName="text-gray-500 bg-opacity-50 py-1.5 ring-inset ring-gray-300"
                bodyClassName="divide-y divide-gray-200 bg-white"
                className="overflow-hidden bg-gray-100 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"
                actions={[Actions.Edit, Actions.Delete]}
                pagerName={'presets'}
                perPage={DEFAULT_PER_PAGE}
                onLoadMore={fetchPresetsPage}
                onActionClick={onActionClick}
                loaderEntities={"recipes"}
            />
        </div>
    );
}
