import 'react-day-picker/lib/style.css';

import React, { useCallback, useState, useEffect } from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils from 'react-day-picker/moment';

interface IDateInputProps {
    placeholder: string;
    value: any;
    onDayChange: (day: any) => void;
}

export default function DateInput(props: IDateInputProps) {
    const { placeholder, value, onDayChange } = props;

    const dayChangeHandler = useCallback((day) => { 

        if(day) {
            onDayChange(day);
        } 
    }, [onDayChange]);

    const [ref, setRef] = useState<DayPickerInput>(null);
    useEffect(() => {
        if(ref && !value) {
            ref.setState({
                value: '',
                typedValue: '',
            });
        }
    }, [ref, value]);

    return (
        // @ts-ignore
        <DayPickerInput
            ref={setRef}
            classNames={{
                container: 'w-full',
                overlay: 'w-0 h-0 overflow-hidden',
                overlayWrapper: 'hidden'
            }}
            placeholder={placeholder}

            value={value}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
            onDayChange={dayChangeHandler}

            inputProps={{
                className: 'DateSelectInput',
            }}
        />
    );
}