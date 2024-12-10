import {
    ExclamationCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/20/solid';
import Tooltip from '../tooltip';

interface InputProps {
    name: string;
    type?: string;
    placeholder?: string;
    onChange?: (event: any) => void;
    value?: string | number;
    required?: boolean;
    error?: string | null;
    label?: string | null;
    readOnly?: boolean;
    hidden?: boolean;
    min?: number;
    max?: number;
    customClassName?: string;
    classNameContainer?: string;
    step?: number;
    tooltipText?: string;
}

export default function Input({
    name,
    type = 'text',
    value = '',
    placeholder = '',
    onChange = () => {},
    required = false,
    error = null,
    label = null,
    readOnly = false,
    hidden = false,
    min = null,
    max = null,
    customClassName = '',
    classNameContainer = '',
    step = 1,
    tooltipText = '',
}: InputProps) {
    const labelString = (required ? '* ' : '') + (label || '');
    return (
        <div className={`${hidden && 'hidden'} ${classNameContainer}]`}>
            <div className="relative rounded-md shadow-sm">
                <input
                    type={type}
                    name={name}
                    id={name}
                    className={`block w-full rounded-md border-0 bg-white px-2 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                        error
                            ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                            : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                    } ${customClassName}`}
                    placeholder={placeholder}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${name}-error` : undefined}
                    value={value === null ? '' : value}
                    onChange={onChange}
                    readOnly={readOnly}
                    onBlur={(e) => {
                        if(e.target.value.trim) {
                            e.target.value = e.target.value?.trim();
                            onChange(e);
                        }
                    }}
                    min={min}
                    max={max}
                    step={step}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {error && (
                        <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                        />
                    )}
                </div>
                {error && (
                    <p
                        className="absolute bottom-[-7px] h-3 left-2 bg-white px-2 text-xs text-red-600"
                        id={`${name}-error`}>
                        {error}
                    </p>
                )}
                {(labelString?.length > 0 || tooltipText?.length > 0) && (
                    <p className="line-height-none absolute left-2 top-[-8px] bg-white px-1 text-xs leading-none text-gray-900">
                        {labelString}{' '}
                        {tooltipText && (
                            <Tooltip textTooltip={tooltipText}>
                                <InformationCircleIcon
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                />
                            </Tooltip>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
