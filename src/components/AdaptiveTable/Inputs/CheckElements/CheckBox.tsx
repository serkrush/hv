import React, { useCallback, useMemo } from 'react';
import {useTranslation} from 'react-i18next';
import { IOptions } from 'src/pagination/IPagerParams';

export interface ICheckboxProps {
    className?: string;
    name?: string;
    checked: boolean;
    option?: IOptions;
    onChange: (id: string, checked: boolean) => void;
}

export default function Checkbox(props: ICheckboxProps){
    const { name, checked, option, onChange, className } = props;
    const { t } = useTranslation();
    
    const labelText = useMemo(() => option?.label? t(option?.label) : '', [option?.label, t]);
    
    const handleCheck = useCallback(() => {
        const value = option?.value? option.value.toString() : '';
        onChange(value, !checked);
    }, [checked, onChange, option]);

    return(
        <div className='flex gap-x-1'>
            <div className="flex items-center">
                <input type='checkbox' name={name} defaultChecked={checked} onChange={handleCheck}/>
            </div>
            <div className="leading-6">
                { option?.label && (
                    <label htmlFor="comments" className={className}>
                        { labelText }
                    </label>
                )}
            </div>
        </div>
    );
}