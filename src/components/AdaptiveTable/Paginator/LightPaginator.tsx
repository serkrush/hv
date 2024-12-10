import React from 'react';
import Pagination from 'react-js-pagination';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'src/components/FaIcons/icons';

interface ILightPaginatorProps {
    currPage: number;
    perPage: number;
    count: number;
    getUrlPage: (i: number) => string;
    onLoadMore: (page: any) => any;
    hoverable?: boolean;
}
interface ILightPaginatorProps {
    count: number;
    perPage: number;
    currPage: number;

    hoverable?: boolean;
    getUrlPage: (i: number) => string;
    onLoadMore: (page: any) => any;
}

export default function LightPaginator (props: ILightPaginatorProps) {
    const {currPage, perPage, count, onLoadMore, getUrlPage, hoverable } = props;
    return (<div className='flex flex-row justify-center items-center pagination space-y-2'>
        {/* @ts-ignore */}
        <Pagination
            // @ts-ignore
            firstPageText={<FaAngleDoubleLeft />}
            // @ts-ignore
            lastPageText={<FaAngleDoubleRight  />}
            hideNavigation={true}
            activePage={currPage}
            itemsCountPerPage={perPage}
            totalItemsCount={count}
            getPageUrl={getUrlPage}
            onChange={onLoadMore}

            innerClass='pageNav'
            itemClass={'pageItem'}

            activeClass='pageItemActive'
            disabledClass='pageItemDisabled'
            
            itemClassFirst='pageItemNav'
            itemClassPrev='pageItemNav'

            itemClassNext='pageItemNav'
            itemClassLast='pageItemNav'
        />
    </div>);
}
