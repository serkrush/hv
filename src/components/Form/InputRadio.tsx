interface ValuesArray {
    id: string;
    title: string;
}
interface InputRadioProps {
    name: string;
    value?: string | number;
    valuesArray: ValuesArray[];
    legend?: string;
    onChange?: (event: any) => void;
}

export default function InputRadio({
    name,
    value = '',
    valuesArray,
    legend = null,
    onChange = () => {},
}: InputRadioProps) {
    return (
        <div>
            <fieldset className="mt-4">
                <legend className="sr-only">{legend}</legend>
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                    {valuesArray?.length > 0 &&
                        valuesArray.map(arrayItem => (
                            <div
                                key={arrayItem.id}
                                className="flex items-center">
                                <input
                                    id={arrayItem.id}
                                    name={name}
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    onChange={onChange}
                                    value={arrayItem.id}
                                    checked={arrayItem.id === value}
                                />
                                <label
                                    htmlFor={arrayItem.id}
                                    className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                    {arrayItem.title}
                                </label>
                            </div>
                        ))}
                </div>
            </fieldset>
        </div>
    );
}
