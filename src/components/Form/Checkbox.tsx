interface CheckboxProps {
    name: string;
    onChange?: (event: any) => void;
    checked?: boolean;
    required?: boolean;
    label?: string | null;
}

export default function Checkbox({
    name,
    checked = false,
    onChange,
    label = null,
}: CheckboxProps) {
    return (
        <fieldset>
            <div className="space-y-5">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id={name}
                            aria-describedby={name}
                            name={name}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            onChange={onChange}
                            checked={checked}
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label
                            htmlFor={name}
                            className="font-medium text-gray-900">
                            {label}
                        </label>
                    </div>
                </div>
            </div>
        </fieldset>
    );
}
