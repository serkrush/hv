/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { IOptions, FilterType } from 'src/pagination/IPagerParams';
import GroupButton from './GroupButton';
import RadioButton from './RadioButton';
import EllipseButton from './EllipseButton';

export interface IRadioItemProps {
    name: string;
    option: IOptions;
    checked?: boolean;
    onChange?: (option: IOptions, checked: boolean) => void;
    className?: string;
    isVerticalDirection?: boolean;
    activeClassName?: string;
}
interface IRadioContainerProps {
    type: FilterType;
    name: string;
    value: string;
    items: IOptions[];
    onChange?: (name: string, value: any) => void;
    className?: string;
    activeClassName?: string;
}

export default function RadioContainer(props: IRadioContainerProps){
    const { type, name, value, items, onChange, className, activeClassName } = props;

    const isVerticalDirection = useMemo(() => [
        FilterType.VerticalRadio,
        FilterType.VerticalGroupButton].includes(type)
    , [type]);
    
    const directionStyle = useMemo(() => {
        switch (type) {
        case FilterType.Radio:
            return 'flex space-x-4';
        case FilterType.EllipseButton:
            return 'w-full flex flex-wrap justify-center lg:justify-start -mt-2 -mb-4';
        case FilterType.VerticalRadio:
            return 'flex-col';
        case FilterType.VerticalGroupButton:
            return 'flex-col justify-start items-start';
        
        }

    }, [type]);

    const [selectedOption, setSelected] = useState({} as IOptions);
    useEffect(() => {
        let initValue = {} as IOptions;
        if(items && items.length > 0){
            const findedOption = items?.filter((option: IOptions) => option?.value === value);
            initValue = (findedOption?.length > 0? findedOption[0] : items[0]) as IOptions;
        }
        setSelected(initValue);
    }, [items, selectedOption, value]);

    const onRadioItemChange = useCallback((option: IOptions, checked: boolean) => {
        if(checked){
            setSelected(option);
            onChange(name, option.value);
        }
    }, [name, onChange]);

    const optionsRender = useMemo(() => items?.map((opt: IOptions) => {
        const radioItem: IRadioItemProps = {
            name: name, option: opt,
            checked: opt.value === selectedOption.value,
            isVerticalDirection: isVerticalDirection,
            onChange: onRadioItemChange,
        };

        switch (type) {
        case FilterType.Radio:
        case FilterType.VerticalRadio:
            return <RadioButton key={`RadioButton_${opt.value}`} {...radioItem} className={className}/>;
        case FilterType.GroupButton:
            return <GroupButton key={`GroupButton_${opt.value}`} {...radioItem} className={className} activeClassName={activeClassName}/>;
        case FilterType.EllipseButton:
            return <EllipseButton key={`EllipseButton_${opt.value}`} {...radioItem} className={className} />;
        }            
    }), [items, name, selectedOption.value, isVerticalDirection, onRadioItemChange, type]);

    return(
        <>
            {(optionsRender?.length > 0) && (
                <div className={`flex ${directionStyle}`}>
                    { optionsRender }   
                </div>
            )}
        </>
    );
}