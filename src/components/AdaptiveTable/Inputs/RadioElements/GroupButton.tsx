import React, { useMemo, useCallback } from 'react';
import { IRadioItemProps } from './RadioContainer';

type IGroupButtonProps = IRadioItemProps

export default function GroupButton(props: IGroupButtonProps){
    const { name, option, checked, isVerticalDirection, onChange, className, activeClassName } = props;

    const handleCheck = useCallback(() => {
        onChange(option, !checked);
    }, [checked, onChange, option]);

    const activeStyle = checked? activeClassName : className;
    const directionStyle = isVerticalDirection
        ? ' text-left first:rounded-t-md last:rounded-b-md'
        : 'first:rounded-l-md last:rounded-r-md';

    return(
        <div onClick={handleCheck} className={`flex justify-center items-center px-2 ${activeStyle} cursor-pointer ${directionStyle}`}>
            <div className='collapse w-0'>
                <input name={name} value={option.value} defaultChecked={checked} type='radio' hidden />
            </div>
            
            <p className='w-full'>
                { option.label}
            </p>
        </div>
    );
}