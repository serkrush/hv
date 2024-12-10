import {ExclamationCircleIcon} from '@heroicons/react/20/solid';

interface SelectProps {
    name: string;
    onChange?: (event: any) => void;
    value?: string | number;
    data: {label: string; value: string}[];
    required?: boolean;
    error?: string | null;
    label?: string | null;
    classNameContainer?: string;
}

export default function Select({
    name,
    value = null,
    data = [],
    onChange = undefined,
    required = false,
    error = null,
    label = null,
    classNameContainer = ''
}: SelectProps) {
    const labelString = `${required ? '* ' : ''}${label ?? ''}`;
    return (
        <div className={classNameContainer}>
            <div className="relative rounded-md shadow-sm">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    id={name}
                    className="block h-[36px] w-full rounded-md border-0 bg-white p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    {data.map(item => {
                        return (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        );
                    })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {error && (
                        <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                        />
                    )}
                </div>
                <p
                    className="absolute bottom-[-7px] left-2 bg-white px-2 text-xs text-red-600"
                    id={`${name}-error`}>
                    {error}
                </p>
                {labelString?.length > 0 && (
                    <p className="line-height-none absolute left-2 top-[-8px] bg-white px-1 text-xs leading-none text-gray-900">
                        {labelString}
                    </p>
                )}
            </div>
        </div>
    );
}
