interface TextareaProps {
    name: string;
    placeholder?: string;
    onChange?: (event: any) => void;
    value?: string | number;
    required?: boolean;
    error?: string | null;
    label?: string | null;
    readOnly?: boolean;
    rows?: number;
    classNameContainer?: string;
}

export default function Textarea({
    name,
    value = '',
    placeholder = null,
    onChange = undefined,
    required = false,
    error = null,
    label = null,
    readOnly = false,
    rows = 3,
    classNameContainer = '',
}: TextareaProps) {
    return (
        <div className={classNameContainer}>
            <div className="relative rounded-md shadow-sm">
                <textarea
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    readOnly={readOnly}
                    onChange={onChange}
                    id={name}
                    name={name}
                    rows={rows}
                    className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <p
                    className="absolute bottom-[-7px] left-2 bg-white px-2 text-xs text-red-600"
                    id={`${name}-error`}>
                    {error}
                </p>
                {label && (
                    <p className="line-height-none absolute left-2 top-[-8px] bg-white px-1 text-xs leading-none text-gray-900">
                        {required && '* '}
                        {label}
                    </p>
                )}
            </div>
        </div>
    );
}
