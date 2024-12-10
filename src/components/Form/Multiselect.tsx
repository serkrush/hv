import React from 'react';

import Select from 'react-select';

interface MultiselectProps {
    name: string;
    options: any[];
    value: any;
    onChange: (event: any) => void;
    error?: any;
    required?: boolean;
    label?: string | null;
    readOnly?:boolean;
    containerMargin?: string
}

export default function Multiselect({
    name,
    options,
    value,
    onChange,
    error,
    required = false,
    label = null,
    readOnly = false,
    containerMargin = '1rem 0',
}: MultiselectProps) {
    const labelString = `${required ? '* ' : ''}${label ?? ''}`;
    return (
        <div className="relative" style={{margin: containerMargin}}>
            <Select
                name={name}
                id="color"
                options={options}
                isMulti
                onChange={value => {
                    onChange(value);
                }}
                isDisabled={readOnly}
                classNames={{
                    control: () => '!bg-white',
                    option: ({data, isDisabled, isFocused, isSelected}) => {
                        let classLine;

                        classLine = `${classLine} ${
                            isDisabled
                                ? undefined
                                : isFocused
                                    ? 'bg-gray-200'
                                    : undefined
                        }`;

                        classLine = `${classLine} ${
                            isDisabled ? 'text-gray-900' : 'text-black'
                        }`;
                        classLine = `${classLine} ${
                            isDisabled ? 'cursor-not-allowed' : 'cursor-default'
                        }`;
                        return classLine;
                    },
                    multiValue: () => '!bg-indigo-600',
                    multiValueLabel: () => '!text-white',
                    multiValueRemove: () =>
                        'text-white hover:!text-black !bg-indigo-600',
                }}
                value={value}
            />
            {error && (
                <p
                    className="absolute bottom-[-7px] left-2 bg-white px-2 text-xs text-red-600"
                    id={`${name}-error`}>
                    {error}
                </p>
            )}
            {labelString?.length > 0 && (
                <p className="line-height-none absolute left-2 top-[-8px] bg-white px-2 text-xs leading-none text-gray-900">
                    {labelString}
                </p>
            )}
        </div>
    );
}
