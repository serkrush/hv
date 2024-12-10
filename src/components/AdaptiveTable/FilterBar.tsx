import React, { useCallback, useEffect, useMemo, useState } from 'react';
import get from "lodash/get";

import { IFieldList } from 'src/pagination/IPagerParams';
import FilterItem from './FilterItem';
import { isEmpty } from '@/src/utils/random';

export interface IFilterBarProps {
    className?: string;
    fields: IFieldList;
    pager?: Map<string, any>;
    onFilterChanged: (field: string, value: string) => void;
}

export default function FilterBar(props: IFilterBarProps) {
    const { fields, pager, onFilterChanged, className } = props;
    const _className = useMemo(() => (className ? className : ''), [className]);

    const getFieldInitialValue = useCallback(
        (fieldname: string) => {
            const filter = get(pager, 'filter');
            const initvalue = filter && filter[fieldname];
            return initvalue ? initvalue : '';
        },
        [pager]
    );
    const [filterItems, setFilterItems] = useState([])

    useEffect(() => {
        if (isEmpty(fields)) {
            return
        }
        setFilterItems(Object.entries(
            Object.keys(fields)
                .filter((field) => fields[field]?.filter)
                .reduce(
                    (r: any, v, i, a, k = fields[v].filter.group) => (
                        (r[k] || (r[k] = [])).push(v), r
                    ),
                    {}
                )
        )
            .map((pair) => {
                return (
                    <div
                        key={'AdaptiveTable_Filter_Row_' + pair[0]}
                        className='flex flex-row flex-wrap content-center'
                    >
                        {Object.values(pair[1]).map((field, j) => {
                            return (
                                <FilterItem
                                    key={`AdaptiveTable_Filter_Field_${j}`}
                                    className={fields[field].filter.className}
                                    labelClassName={fields[field].filter?.labelClassName}
                                    inputClassName={fields[field].filter?.inputClassName}
                                    activeClassName={fields[field].filter?.activeClassName}
                                    label={fields[field].filter?.customLabel ?? fields[field].label}
                                    type={fields[field].type}
                                    icon={fields[field].filter.icon}
                                    name={field}
                                    showLabel={fields[field].filter.showLabel}
                                    options={fields[field].filter.options}
                                    placeholder={fields[field].placeholder}
                                    value={getFieldInitialValue(field)}
                                    onFilterChanged={onFilterChanged}
                                />
                            );
                        })}
                    </div>
                );
            }));
    }, [fields, getFieldInitialValue, onFilterChanged]);
    
    const isHaveFilterItems = filterItems.length;
    return (
        <>
            {isHaveFilterItems ? (
                <div
                    className={`${_className} sm:flex flex-col`}
                >
                    {filterItems}
                </div>
            ) : ''}
        </>
    );
}
