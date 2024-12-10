/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import has from "lodash/has";
import get from "lodash/get";
import union from "lodash/union";

import { useSelector, useDispatch } from 'react-redux';
import { pageSetFilter, pageSelectItem } from 'store/types/actionTypes';
import { BaseEntity } from 'src/entities/BaseEntity';
import Paginator from './Paginator';
import Row from './Row';
import LightPaginator from './Paginator/LightPaginator';
import FilterBar from './FilterBar';
import HeadItem from './HeadItem';
import {
    IFieldList,
    PaginationType,
    Sort,
    Actions,
    IPagerParams,
    FilterType,
} from 'src/pagination/IPagerParams';
import { withRequestResult } from './withRequest';
import {useTranslation} from 'react-i18next';
import { isFunction } from 'src/utils/random';
import { ISortOptions } from './SortBy';
import { IMenu } from '@/acl/types';
import LeftRight from './Paginator/LeftRight';
import InsetSpinner from '../InsetSpinner';
import { CheckType } from '../SpinnerBase';

const FILTER_TIMEOUT = 500;

interface IAdaptiveTable {
    fields: IFieldList;
    pagerName: string;
    onLoadMore: (loadParams: IPagerParams) => void;
    perPage: number;

    // optional parameters
    className?: string;
    rowClassName?: string;
    bodyClassName?: string;
    actions?: Actions[];
    noHeader?: boolean;
    isShadow?: boolean;
    isOverflow?: boolean;
    typeOfPagination?: PaginationType;
    colors?: string[];
    actionClassName?: string;
    actionMenu?: IMenu;
    getUrlPage?: (i: number) => string;
    onSelectRow?: (selectedItems: any[]) => void;
    onFilterChanged?: (field: string, value: string) => void;
    pageSetFilter?: (pageName: string, filter: object, sort: object) => void;
    loaderEntities?: CheckType | CheckType[];

    drawSubRow?: (data: any) => JSX.Element;
    onActionClick?: (
        action: Actions,
        data: any,
        pagerParams: IPagerParams
    ) => void;
    actionIsDisabled?: (action: Actions, data: any) => boolean;

    onTdClick?: (field: string, data: any) => void;
    onRowClick?: (data: any) => void;

    onItemChange?: (id: string, value: any, field: string) => void;
}

let bufItems: any[] = null;
function AdaptiveTable(props: IAdaptiveTable) {
    const {
        actions,
        isShadow,
        isOverflow,
        noHeader,
        perPage,
        pagerName,
        typeOfPagination,
        colors,
        className,
        rowClassName,
        bodyClassName,
        actionClassName,
        actionMenu,
        onRowClick,
        onTdClick,
        onSelectRow,
        onItemChange,
        onActionClick,
        getUrlPage,
        onLoadMore,
        onFilterChanged,
        actionIsDisabled,
        drawSubRow,
        loaderEntities
    } = props;

    const { t } = useTranslation();
    const pager = useSelector((state: any) => state.pagination[pagerName]);
    const dispatch = useDispatch();
    const paginationType = typeOfPagination || PaginationType.SHORT;
    const currPage = pager ? get(pager, 'currentPage') : null;
    const withSelectRow = isFunction(onSelectRow);
    const count = pager ? get(pager, 'count') : null;

    if (bufItems == null || (pager && !get(pager, 'fetching'))) {
        bufItems = BaseEntity.getPagerItems(pagerName);
    }

    const fields = useMemo(() => {
        let fields = props.fields;
        if (withSelectRow) {
            fields = Object.assign(
                {
                    ['toucher']: {
                        type: FilterType.Touche,
                        column: { editable: true },
                    },
                },
                fields
            );
        }
        return fields;
    }, [props.fields, withSelectRow]);
    
    useEffect(() => {
        if (pagerName) {
            const pFilter = has(pager, 'filter')
                ? get(pager, 'filter')
                : {};
            const pSort = has(pager, 'sort') ? get(pager, 'sort') : {};

            Object.keys(fields).map((field: any) => {
                const fieldValue = fields[field];

                const isFilter = has(fieldValue, 'filter');
                const isHaveInitValue = has(fieldValue, 'initialValue');

                if (
                    isFilter &&
                    isHaveInitValue &&
                    !has(pFilter, field)
                ) {
                    pFilter[field] = fieldValue.initialValue;
                }
            });
            // dispatch(pageSetFilter(pagerName, pFilter, pSort));
            onLoadMore!({
                page: 1,
                pageName: pagerName,
                perPage,
                filter: pFilter,
                sort: pSort
            });
        }
    }, []);

    const handleLoadMore = useCallback(
        (pageNumber: any, direction: string) => {
            if (pager && !get(pager, 'fetching')) {
                const pFilter = has(pager, 'filter')? get(pager, 'filter') : {};
                const pSort = has(pager, 'sort') ? get(pager, 'sort') : {};

                const ids = pager.pages[pager.currentPage].ids;
                let lastDocumentId = pager.pages[pager.currentPage].prevLastDocumentId;
                if (direction === 'next') {
                    lastDocumentId = ids.length > 0 ? ids[ids.length - 1] : undefined;
                }
                onLoadMore!({
                    page: pageNumber,
                    pageName: pagerName,
                    filter: pFilter,
                    sort: pSort,
                    perPage,
                    lastDocumentId,
                } as IPagerParams);
            }
        },
        [onLoadMore, pager, pagerName, perPage]
    );

    const timerID: any = useRef(null);
    const handleOldFilterEvent = useCallback(
        (name: string, value: any) => {
            if (timerID.current !== null) {
                clearTimeout(timerID.current);
                timerID.current = null;
            }
            timerID.current = setTimeout(() => {
                onFilterChanged(name, value);
            }, FILTER_TIMEOUT);
        },
        [onFilterChanged]
    );

    const handleFilterEvent = useCallback(
        (name: string, value: any) => {
            if (timerID.current !== null) {
                clearTimeout(timerID.current);
                timerID.current = null;
            }

            const pFilter = has(pager, 'filter') ? { ...get(pager, 'filter') }: {};
            const pSort = has(pager, 'sort') ? { ...get(pager, 'sort') }: {};

            if (pagerName) {
                if (name === 'filterReset') {
                    Object.keys(pFilter)
                        ?.filter((f) => fields[f]?.filter)
                        .map((f) => delete pFilter[f]);
                } else {
                    if (value) {
                        pFilter[name] = value;
                    } else {
                        delete pFilter[name];
                    }
                }
                // dispatch(pageSetFilter(pagerName, { ...pFilter },  { ...pSort }));
            }

            timerID.current = setTimeout(() => {
                onLoadMore!({
                    page: 1,
                    pageName: pagerName,
                    filter: pFilter,
                    sort: pSort,
                    perPage: perPage,
                    force: true,
                } as IPagerParams);
            }, FILTER_TIMEOUT);
        },
        [dispatch, fields, onLoadMore, pager, pagerName, perPage]
    );

    const handleSortEvent = useCallback(
        (field: string, sort: Sort) => {
            const pFilter = has(pager, 'filter')? get(pager, 'filter'): {};
            const pSort = { field, sort };
            // dispatch(pageSetFilter(props.pagerName, pFilter, pSort));
            if (timerID.current !== null) {
                clearTimeout(timerID.current);
                timerID.current = null;
            }
            timerID.current = setTimeout(() => {
                onLoadMore!({
                    page: 1,
                    pageName: pagerName,
                    filter: pFilter,
                    sort: pSort,
                    perPage: perPage,
                    force: true,
                } as IPagerParams);
            }, FILTER_TIMEOUT);
        },
        [dispatch, onLoadMore, pager, pagerName, perPage, props.pagerName]
    );

    const isShadowStyle = isShadow ? 'shadow-xl rounded-lg' : '';
    const isOverflowStyle = isOverflow ? 'overflow-auto md:overflow-visible' : 'overflow-auto';
    const isTouchedAll = useMemo(() => {
        const pageIDS = get(pager, [
            'pages',
            get(pager, 'currentPage'),
            'ids',
        ]);
        const touched = get(pager, 'touched');
        return pageIDS?.every((id) => touched?.contains(id));
    }, [pager]);

    const handleOnItemChange = useCallback(
        (id: string, value: any, field: string) => {
            if ( "function" === typeof onItemChange) {
                onItemChange(id, value, field);
            }
        },
        [onItemChange]
    );

    const onSelectRowHandler = useCallback(
        (selectedIds: string[] | string, needAdd: boolean) => {
            const touchedList: any[] = get(pager, 'touched');
            let selected = [];

            if (Array.isArray(selectedIds)) {
                if (needAdd) {
                    selected = union(selectedIds, touchedList);
                } else {
                    selected = touchedList?.filter(
                        (touch) => !selectedIds.includes(touch)
                    );
                }
            } else {
                const index = touchedList.indexOf(selectedIds);
                selected =
                    index !== -1
                        ? touchedList.splice(index, 1)
                        : touchedList.concat(selectedIds);
            }
            dispatch(pageSelectItem(get(pager, 'pageName'), selected));

            if (withSelectRow) {
                onSelectRow(
                    bufItems?.filter((item) =>
                        selected.includes(item.get('id'))
                    )
                );
            }
        },
        [dispatch, onSelectRow, pager, withSelectRow]
    );

    const onSelectOneRow = useMemo(() => {
        return withSelectRow
            ? (id: string) => onSelectRowHandler(id, isTouchedAll)
            : null;
    }, [isTouchedAll, onSelectRowHandler, withSelectRow]);

    const onSelectAllRows = useCallback(() => {
        onSelectRowHandler(
            get(pager, ['pages', get(pager, 'currentPage'), 'ids']),
            !isTouchedAll
        );
    }, [isTouchedAll, onSelectRowHandler, pager]);

    const pagination = useMemo(() => {
        switch (paginationType) {
        default:
            return (
                <LeftRight
                    count={count}
                    perPage={perPage}
                    page={currPage}
                    onLoadMore={handleLoadMore}
                />
            );
            break;
        }
    }, [count, currPage, getUrlPage, handleLoadMore, perPage, paginationType]);

    const sort = useMemo(() => {
        // only paginators have sort and filter properties in redux
        const pagerSort = pager && get(pager, 'sort');
        if (pagerSort) {
            return {
                field: get(pagerSort, 'field'),
                sort: get(pagerSort, 'sort'),
            };
        } else {
            return { field: '', sort: Sort.none };
        }
    }, [pager]);

    const tableRows = useMemo(() => {
        if (bufItems && bufItems.length) {
            return bufItems.map((item: any, i: number) => {
                return (
                    item && (
                        <Row
                            key={`AdaptiveTable_Row_${i}`}
                            data={item}
                            pager={pager}
                            columns={fields}
                            actions={actions}
                            rowClassName={rowClassName}
                            actionClassName={actionClassName}
                            actionMenu={actionMenu}
                            onSelectOneRow={onSelectOneRow}
                            drawSubRow={drawSubRow}
                            subRowBackground={colors ? colors[i] : false}
                            onActionClick={onActionClick}
                            actionIsDisabled={actionIsDisabled}
                            onRowClick={onRowClick}
                            onTdClick={onTdClick}
                            onItemChange={handleOnItemChange}
                        />
                    )
                );
            });
        } else {
            return (
                <tr>
                    <td colSpan={fields && Object.keys(fields).filter(k => 'column' in fields[k]).length}>
                        <p className='whitespace-nowrap text-gray-500 my-auto text-center w-full text-lg'>
                            {t('no-entries-yet')}
                        </p>
                    </td>
                </tr>
            );
        }
    }, [
        actionClassName,
        actionMenu,
        actions,
        fields,
        drawSubRow,
        handleOnItemChange,
        onActionClick,
        actionIsDisabled,
        onRowClick,
        onSelectOneRow,
        onTdClick,
        pager,
        t,
    ]);

    const SortByOptions: Array<ISortOptions> = useMemo(() => {
        return Object.keys(fields)
            .filter((f) => fields[f]?.sorted && !fields[f].column)
            .map((f) =>
                Object({
                    label: fields[f]?.label,
                    value: f,
                    sort: getFieldSort(sort, f),
                })
            );
    }, [fields, sort]);

    const tableBlock = (
        <div
            className={` ${isShadowStyle} ${isOverflowStyle} ${className ? className : ''} relative`}
        >
            {loaderEntities && <InsetSpinner checkEntities={loaderEntities}/>}
            <table className={`w-full`}>
                {!noHeader && (
                    <thead>
                        <tr>
                            {drawSubRow && isFunction(drawSubRow) && <td />}
                            {fields &&
                                Object.keys(fields)
                                    .filter((field) => fields[field].column)
                                    .map((f, i) => {
                                        return (
                                            // @ts-ignore
                                            <HeadItem
                                                key={`AdaptiveTable_Item_Head_${i}`}
                                                headClassName={
                                                    fields[f].column.itemClassName
                                                }
                                                label={fields[f].label}
                                                field={f}
                                                fieldType={fields[f].type}
                                                sorted={fields[f]?.sorted}
                                                sort={getFieldSort(sort, f)}
                                                isTouchedAll={isTouchedAll}
                                                onSortChanged={handleSortEvent}
                                                onSelectAllRowClick={
                                                    onSelectAllRows
                                                }
                                            />
                                        );
                                    })}
                            {actions?.length > 0 && (
                                // @ts-ignore
                                <HeadItem
                                    key='AdaptiveTable_Item_Head_Action'
                                    pagerName={pagerName.toUpperCase()}
                                    headClassName='flex flex-row justify-end'
                                    sortBy={SortByOptions}
                                    onSortChanged={handleSortEvent}
                                    field=''
                                />
                            )}
                        </tr>
                    </thead>
                )}
                <tbody className={`${bodyClassName}`}>
                    {tableRows}
                </tbody>
            </table>
        </div>
    );

    const WrappedBlock = withRequestResult(() => tableBlock, { pager });

    return (
        <div className= 'flex flex-col'>
            <FilterBar
                pager={pager}
                fields={fields}
                onFilterChanged={
                    onFilterChanged ? handleOldFilterEvent : handleFilterEvent
                }
            />
            {pager && count >= 1 && <div className=''>{pagination}</div>}

            <WrappedBlock />

            {pager && count > 1 && <div className=''>{pagination}</div>}
        </div>
    );
}

const getFieldSort = (sort, f) => {
    return sort.field === f ? sort.sort : Sort.none;
};

export default AdaptiveTable;
