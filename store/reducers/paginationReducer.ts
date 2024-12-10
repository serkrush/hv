import { PAGE_SELECT_ITEM, PAGE_SET_FILTER, PAGE_FETCHING, PAGE_CLEAR, PAGE_CLEAR_ALL } from "@/store/types/actionTypes";
const initialPagerState: any = {};

export function pagination(state = initialPagerState, action: any) {
    // get result for the paginator, disable fetching
    if (action?.payload?.data?.result && action.payload.pager) {
        const pager = action.payload.pager;
        const result = action.payload.data.result;
        if (pager.pageName) {
            const pageName = pager.pageName;

            let pagination = state[pageName] ? state[pageName] : {};
            let pages = pagination["pages"] ? pagination["pages"] : {};
            let prevLastDocumentId = pages[pager.page - 1]?.lastDocumentId
            let item: any | null = null;

            if (result?.length === 0) {
                pager.page = pages?.size ?? 1;
            } else {
                item = {
                    ids: result,
                    lastDocumentId: pager.lastDocumentId ?? null,
                    prevLastDocumentId: prevLastDocumentId ?? null
                };
            }

            return {
                ...state,
                [pageName]: {
                    ...state[pageName],
                    ...pagination,
                    entityName: pager.entityName,
                    pageName: pageName,
                    currentPage: pager.page,
                    count: pager.count,
                    perPage: pager.perPage,
                    pages: {
                        ...pages,
                        [pager.page]: item,
                    },
                },
            };
        }
    }
    // prepare item for the paginator, enable fetching
    const { type } = action;
    switch (type) {
    case PAGE_FETCHING: {
        const { pageName, page, isFetching } = action;
        let pagination = state[pageName] ? state[pageName] : {};
        let currentPage = pagination["currentPage"];

        if (pagination["pages"] && pagination["pages"][page]) {
        //to avoid empty page before loading new page data

            currentPage = page;
        }
        const newState = {
            ...state,
            [pageName]: {
                ...state[pageName],
                ...pagination,
                currentPage,
                fetching: isFetching,
            },
        };
        return newState;
    }
    case PAGE_SET_FILTER: {
        const { pageName, filter, sort } = action;
        let pagination = state[pageName] ? state[pageName] : {};
        const newState = {
            ...state,
            [pageName]: {
                ...state[pageName],
                ...pagination,
                filter: filter,
                sort: sort,
            },
        };
        return newState;
    }

    case PAGE_SELECT_ITEM:
        {
            const { pageName, selectedItems } = action;
            let pagination = state[pageName] ? { ...state[pageName ]} : {};
            pagination['touched'] = selectedItems;
            const newState = {
                ...state,
                [pageName]: {
                    ...state[pageName],
                    ...pagination,
                }
            };
            return newState;
        }
        break;

    case PAGE_CLEAR: {
        const { pageName } = action;
        const newState = {
            ...state,
            [pageName]: {
                ...state[pageName],
                pages: {},
            },
        };
        return newState;
    }

    case PAGE_CLEAR_ALL: {
        const newState = {
        
        };
        return newState;
    }
    }

    return state;
}
