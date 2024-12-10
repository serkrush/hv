import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { IOptions, FilterType } from 'src/pagination/IPagerParams';
import Checkbox from './CheckBox';

export interface IRadioItemProps {
    name: string;
    option: IOptions;
    checked?: boolean;
    onChange?: (option: IOptions, checked: boolean) => void;
}

interface ICheckContainerProps {
    type: FilterType;
    
    name: string;
    value: string[];
    items: IOptions[];
    className?: string,
    onChange?: (name: string, value: any) => void;
}

export default function CheckContainer(props: ICheckContainerProps){
    const { name, value, items, type, onChange, className } = props;

    const [selectedOptions, setSelected] = useState([]);

    useEffect(() => {
        const selectedOptions = value && [].concat(value)?.filter((opt: string) => items?.map(item => item.value).includes(opt));
        const initValue = selectedOptions? selectedOptions : [];
        setSelected(initValue);
    }, [items, value]);

    const onCheckBoxChange = useCallback((id: string, checked: boolean) => {
        let newOptions = selectedOptions.map(i => i);
        
        if(checked){
            newOptions.push(id);
        }else{
            newOptions = selectedOptions?.filter(item => item !== id);
        }

        setSelected(newOptions);
        onChange(name, newOptions);
    }, [name, onChange, selectedOptions]);

    const containerStyle = [FilterType.VerticalCheckBox].includes(type) ? '': 'flex space-x-4';
    return(
        <div className={`${containerStyle}` }>
            {
                items && items.map((opt: IOptions, i: number) => (
                    <Checkbox 
                        key={`CheckBox_${i}`} 
                        className={className}
                        name={name} 
                        option={opt} 
                        onChange={onCheckBoxChange}
                        checked={selectedOptions.includes(opt.value.toString())} />
                ))
            }

        </div>
    );
}