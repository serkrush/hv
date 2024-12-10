import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

interface LabelProps {
    name: string;
    value?: string | number;
}

export default function Label({ name, value }: LabelProps) {
    return (
        <label
            htmlFor={name}
            className="block text-sm font-medium leading-6 text-gray-900"
        >
            {value}
        </label>
    );
}
