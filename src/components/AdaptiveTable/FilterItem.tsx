/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo } from 'react';
import {useTranslation} from 'react-i18next';
import { FilterType, InputIcon, IOptions } from 'src/pagination/IPagerParams';
import Input from './Inputs/Input';
import Select from './Inputs/Select';
import RadioContainer from './Inputs/RadioElements/RadioContainer';
import CheckContainer from './Inputs/CheckElements/CheckContainer';
import FilterReset from './Inputs/FilterReset';
import DateSelector from './Inputs/DateSelector';

export interface IFilterItemProps {
    className: string;
    label: string;
    type: FilterType;
    icon?: InputIcon;
    name: string;
    value: any;
    showLabel?: boolean;
    placeholder: string;
    labelClassName?: string;
    inputClassName?: string;
    activeClassName?: string;

    options?: Array<IOptions>;
    onFilterChanged: (field: string, value: any) => void;
}
export default function FilterItem(props: IFilterItemProps) {
    const {
        value,
        className,
        type,
        icon,
        name,
        label,
        options,
        showLabel,
        placeholder,
        labelClassName,
        inputClassName,
        activeClassName,
        onFilterChanged,
    } = props;
    const { t } = useTranslation();

    const handleOnChange = useCallback(
        (filterName: string, filterValue: any) => {
            onFilterChanged(filterName, filterValue);
        },
        [onFilterChanged]
    );

    const element = useMemo(() => {
        switch (type) {
        default:
        case FilterType.Text:
            return (
                <Input
                    name={name}
                    value={value}
                    icon={icon}
                    className={inputClassName}
                    placeholder={placeholder}
                    onChange={handleOnChange}
                />
            );
        case FilterType.Select:
            return (
                <Select
                    name={name}
                    value={value}
                    items={options}
                    className={inputClassName}
                    onChange={handleOnChange}
                />
            );

        case FilterType.CheckBox:
        case FilterType.VerticalCheckBox:
            return (
                <CheckContainer
                    name={name}
                    value={value}
                    items={options}
                    type={type}
                    className={inputClassName}
                    onChange={handleOnChange}
                />
            );

        case FilterType.DateRange:
        case FilterType.SingleDate:
            return (
                <DateSelector
                    name={name}
                    value={value}
                    type={type}
                    onChange={handleOnChange}
                />
            );

        case FilterType.Radio:
        case FilterType.GroupButton:
        case FilterType.EllipseButton:
        case FilterType.VerticalRadio:
        case FilterType.VerticalGroupButton:
            return (
                <RadioContainer
                    name={name}
                    value={value}
                    items={options}
                    type={type}
                    className={inputClassName}
                    activeClassName={activeClassName}
                    onChange={handleOnChange}
                />
            );
        case FilterType.FilterReset: {
            return <FilterReset name={name} onChange={handleOnChange} />;
        }
        }
    }, [handleOnChange, icon, name, options, placeholder, type, value]);

    return (
        <div
            className={`${
                className ? className : ''
            } flex flex-row justify-start `}
        >
            {showLabel && label && (
                <div className={'flex flex-row items-center mx-1'}>
                    <p
                        className={`font-normal whitespace-nowrap ${
                            labelClassName ? labelClassName : ''
                        }`}
                    >
                        {t(label)}
                    </p>
                </div>
            )}
            <div className='h-full w-full flex flex-row items-center '>
                {element}
            </div>
        </div>
    );
}
