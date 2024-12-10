/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useMemo, MouseEvent } from 'react';
import get from "lodash/get";
import { IOptions, IFieldList, FilterType } from 'src/pagination/IPagerParams';
import Checkbox from './Inputs/CheckElements/CheckBox';
import Input from './Inputs/Input';
import Select from './Inputs/Select';
import RadioContainer from './Inputs/RadioElements/RadioContainer';
import DateSelector from './Inputs/DateSelector';
import { isFunction } from 'src/utils/random';

interface IRowItemProps {
    data: Map<string, any>;
    field: string;
    columns: IFieldList;
    onTdClick?: (field: string, data: any) => void;
    onItemClick?: (field: string, data: any) => void;
    onSelectOneRow?: (id: string) => void;
    onItemChange: (field: string, value: any, data: any) => void;
    pager?: any;
}

interface IFilterItemState {
    [key : string] : any;
    selectedOption: IOptions;
}

export default function RowItem(props: IRowItemProps){
    const { field, data, columns, pager, onTdClick, onItemChange, onSelectOneRow} = props;

    const [state, setState] = useState({ [field]: get(data, field) });

    const handleTdClick = useCallback((e: MouseEvent) => {
        if (isFunction(onTdClick)) {
            e.stopPropagation();
            onTdClick(field, data);
        }
    }, [data, field, onTdClick]);

    const handleChange = useCallback((field: string, value: any) => {
        setState({ [field]: value});
        if (isFunction(onItemChange)) {
            onItemChange(field, value, data);
        }
    }, [field, onItemChange]);

    const handleSelectOneRow = useCallback((id: string) => {
        if (typeof onSelectOneRow === 'function') {
            onSelectOneRow(id);
        }
    }, [onSelectOneRow]);
    

    const editable = columns[field].column.editable;
    const draw = columns[field].column.draw;
    const tdClass = editable? 'text-center' : columns[field].column.itemClassName;
    const disabled = columns[field].column.disabled;
    const disabledItem: any = disabled && disabled(data, field);

    /**
     * TODO: For RowItem when adding functionality for changing string values,
     * revise the process of obtaining field names and their values.
     */
    const element = useMemo(() => {
        const type = columns[field].type;

        if (editable) {
            switch (type) {
            case FilterType.Text:
                return <Input
                    name={field}
                    value={state[field]}
                    className={columns[field].column.inputClassName }
                    placeholder={columns[field].placeholder}
                    onChange = {handleChange}/>;
            case FilterType.Number:
                return <Input
                    name={field}
                    value={state[field]}
                    placeholder={columns[field].placeholder}
                    className={columns[field].column.inputClassName }
                    onChange = {handleChange}
                    onlyNumber />;
            case FilterType.Select:
                return <Select
                    name={field}
                    value={state[field]}
                    className={columns[field].column.inputClassName }
                    items = { columns[field].column.options }
                    onChange={ handleChange }/>;
            case FilterType.CheckBox:
                return <Checkbox
                    name={field}
                    checked={data && get(data, field) ? true : false}
                    option={{label: 'need set label', value: 'xxx'}}
                    className={columns[field].column.inputClassName }
                    onChange={ handleChange } />;
            case FilterType.DateRange: 
                return <DateSelector
                    name={field}
                    onChange={ handleChange } />;
            case FilterType.Radio:
            case FilterType.GroupButton: {
                return <RadioContainer name={''}
                    value={'null'}
                    items={columns[field].column.options}
                    className={columns[field].column.inputClassName }
                    type={type}
                    onChange={ handleChange } />;
            }
            case FilterType.Touche:{
                const itemID = get(data, 'id');
                const checked = get(pager, 'touched')?.toArray().includes(itemID);

                return <Checkbox
                    checked={checked}
                    className={columns[field].column.inputClassName }
                    option={{label:'', value: itemID}}
                    onChange={ handleSelectOneRow } />;
            }}
        }else{
            return draw
                ? draw(data, field)
                : get(data, field);
        }
    }, [columns, data, disabledItem, draw, editable, field, handleChange, handleSelectOneRow, pager, state]);

    return (
        <td className={tdClass} onClick={handleTdClick}>
            {element}
        </td>
    );
}