import React, { useCallback, useMemo } from 'react';
import { IRadioItemProps } from './RadioContainer';
import {useTranslation} from 'react-i18next';

type IRadioProps = IRadioItemProps

export default function Radio(props: IRadioProps){
    const { name, option, checked, onChange, className } = props;
    const { t } = useTranslation();

    const labelText = useMemo(() => option?.label? t(option?.label) : '', [option?.label, t]);

    const handleCheck = useCallback(() => {
        onChange(option, !checked);
    }, [checked, onChange, option]);

    return(
        <div className='flex gap-x-1'>
            <div className="flex items-center">
                <input type='radio' name={name} defaultChecked={checked} onChange={handleCheck}/>

            </div>
            { option?.label && (
                <label htmlFor="comments" className={className}>
                    { labelText }
                </label>
            )}
        </div>
    );
}