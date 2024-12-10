/* eslint-disable react-hooks/exhaustive-deps */
// import './_inputs.scss';
import React, {
    useCallback,
    useMemo,
    useEffect,
    useState,
    useRef,
    KeyboardEvent,
} from 'react';
import {
    FaSpinner,
    FaEnvelope,
    FaSearchLight,
    FaPen,
} from 'src/components/FaIcons/icons';
import { InputIcon } from 'src/pagination/IPagerParams';
import {useTranslation} from 'react-i18next';
import { isNumber } from 'src/utils/random';

interface IInputProps {
    className?: string;
    name: string;
    value?: string;
    focus?: boolean;
    icon?: InputIcon;
    placeholder: string;
    onlyNumber?: boolean;
    onChange?: (name: string, value: string) => void;
}

export default function Input(props: IInputProps) {
    const {
        className,
        placeholder,
        focus,
        name,
        value,
        icon,
        onChange,
        onlyNumber,
    } = props;
    const { t } = useTranslation();

    const [textInput, setTextInput] = useState(null);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const initValue = typeof value === 'string' ? value.toString() : value;
        setInputValue(initValue);
        if (focus) {
            textInput.focus();
        }
    }, [focus, textInput, value]);

    const handleChange = useCallback(
        (e: any) => {
            const newInputValue = e.target.value;
            setInputValue(newInputValue);
            if (onlyNumber) {
                if (!isNumber(newInputValue)) {
                    setInputValue(newInputValue);
                }
            } else {
                setInputValue(newInputValue);
            }
        },
        [name, onChange]
    );

    const handleBlur = (e) => {
        const newInputValue = e.target.value;
        if (e.target.value.toString() !== value?.toString()) {
            onChange(name, newInputValue.toString()?.trim());
        }
    };

    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter') {
            onChange(name, inputValue);
        }
    };

    const placeholderValue = useMemo(
        () => (placeholder ? t(placeholder) : ''),
        [placeholder, t]
    );
    useEffect(() => {
        setInputValue(value);
        if (focus) {
            textInput.focus();
        }
    }, [focus, textInput, value]);

    const timerID = useRef(null);

    const getIcon = useMemo(() => {
        switch (icon) {
        case InputIcon.SEARCH:
            return <FaSearchLight />;
        case InputIcon.EMAIL:
            return <FaEnvelope className='text-base' />;
        case InputIcon.SPINNER:
            return <FaSpinner className='text-yellow-500 animate-spin' />;
        case InputIcon.EDIT:
            return <FaPen className='text-xs' />;
        default:
            return null;
        }
    }, [icon]);

    return (
        <div>
            {getIcon && (
                <div className=''>
                    <div className='w-7 h-7 flex justify-center items-center'>
                        {getIcon}
                    </div>
                </div>
            )}

            <input
                ref={setTextInput}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={`focus:outline-none px-2 ${className} `}
                placeholder={placeholderValue}
                value={inputValue}
                name={name}
                type='text'
            />
        </div>
    );
}
