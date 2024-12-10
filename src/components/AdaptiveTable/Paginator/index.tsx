import React from 'react';
import Pagination from 'react-js-pagination';
// import {useTranslation} from 'react-i18next';
import {
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaAngleLeft,
    FaAngleRight,
} from 'src/components/FaIcons/icons';

interface IPaginatorProps {
    count: number;
    perPage: number;
    currPage: number;

    hoverable?: boolean;
    getUrlPage: (i: number) => string;
    onLoadMore: (page: any) => any;
}

export default function Paginator(props: IPaginatorProps) {
    const { count, perPage, currPage, hoverable, getUrlPage, onLoadMore } =
        props;
    // const { t } = useTranslation();

    const countPages = Math.ceil(count / perPage) || 0;
    const offset = perPage * (currPage - 1) || 1;
    const maxOnPage = currPage * perPage;
    const limit = maxOnPage > count ? count : maxOnPage;

    return (
        <div className='flex flex-col md:flex-row items-center md:justify-between pagination space-y-2'>
            {/* @ts-ignore */}
            <Pagination
                // @ts-ignore
                firstPageText={<FaAngleDoubleLeft />}
                // @ts-ignore
                lastPageText={<FaAngleDoubleRight />}
                // @ts-ignore
                prevPageText={<FaAngleLeft />}
                // @ts-ignore
                nextPageText={<FaAngleRight />}
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

            <p className='text-sm font-normal'>
                {/* {t('showing-of', { offset, limit, count })} */}
            </p>
        </div>
    );
}
