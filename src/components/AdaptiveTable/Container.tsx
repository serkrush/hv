/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import has from "lodash/has";
import get from "lodash/get";

import { useSelector, useDispatch } from 'react-redux';
import { pageSetFilter } from 'store/types/actionTypes';
import { BaseEntity } from 'src/entities/BaseEntity';
import Paginator from './Paginator';
import LightPaginator from './Paginator/LightPaginator';
import FilterBar from './FilterBar';
import {
    IFieldList,
    PaginationType,
    IPagerParams,
} from 'src/pagination/IPagerParams';
import {useTranslation} from 'react-i18next';
import LeftRight from './Paginator/LeftRight';
import { withRequestResult } from './withRequest';

const FILTER_TIMEOUT = 500;

interface IAdaptiveContainer {
    fields?: IFieldList;
    pagerName: string;
    perPage?: number;
    typeOfPagination?: PaginationType;
    
    onLoadMore: (loadParams: IPagerParams) => void;
    item: (data: any, index: number) => JSX.Element;
    onFilterChanged?: (field: string, value: string) => void;
    getUrlPage?: (i: number) => string;
}

let bufItems: any = null;

function AdaptiveContainer (props: IAdaptiveContainer) {
    const { 
        perPage = 9999, pagerName, fields, typeOfPagination, item, onLoadMore, 
        getUrlPage, onFilterChanged, 
    } = props;

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const pager = useSelector((state: any) => state.pagination[pagerName]);
    const currPage = pager ? get(pager, 'currentPage') : null;
    const count = pager ? get(pager, 'count') : null;
    const paginationType = typeOfPagination || PaginationType.SHORT;

    if (bufItems == null || (pager && !get(pager, 'fetching'))) {
        bufItems = BaseEntity.getPagerItems(pagerName);
    }

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
            dispatch(pageSetFilter(pagerName, pFilter, pSort));
            onLoadMore({
                page: 1,
                pageName: pagerName,
                perPage,
                force: true,
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
                onLoadMore({
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
                dispatch(pageSetFilter(pagerName, { ...pFilter },  { ...pSort }));
            }

            timerID.current = setTimeout(() => {
                onLoadMore({
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
    
    const pagination = useMemo(() => {
        switch (paginationType) {
        // case PaginationType.LIGHT:
        //     return (
        //         <LightPaginator
        //             count={count}
        //             perPage={perPage}
        //             currPage={currPage}
        //             getUrlPage={getUrlPage}
        //             onLoadMore={handleLoadMore}
        //         />
        //     );
        // case PaginationType.MEDIUM:
        //     return (
        //         <Paginator
        //             count={count}
        //             perPage={perPage}
        //             currPage={currPage}
        //             getUrlPage={getUrlPage}
        //             onLoadMore={handleLoadMore}
        //         />
        //     );
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

    const tableBlock = useMemo(() => {
        if (bufItems && bufItems.length) {
            return bufItems.map((data: any, i: number) => {
                return (
                    item && (
                        <React.Fragment key={i}>
                            { item(data, i) }
                        </React.Fragment>
                    )
                );
            });
        } else {
            return (
                <div className='pt-40 xs:pt-30 mb-4 bg-rust min-h-96'>
                    <h2 className='bg-paper py-10 font-serif text-5xl text-gray-950 text-center'>
                        { t('no-entries-yet') }
                    </h2>
                </div>
            );
        }
    }, [pager, bufItems]);


    const WrappedBlock = withRequestResult(() => tableBlock, { pager });

    return (
        <div className={'flex flex-col'}>
            <FilterBar
                pager={pager}
                fields={fields}
                onFilterChanged={
                    onFilterChanged ? handleOldFilterEvent : handleFilterEvent
                }
            />
            {pager && count > 1 && <div className=''>{pagination}</div>}

            <WrappedBlock />
            
            {pager && count > 1 && <div className=''>{pagination}</div>}

        </div>
    );
}
export default AdaptiveContainer;
