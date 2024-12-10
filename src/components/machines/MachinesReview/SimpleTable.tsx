interface TableProps {
    columns: Array<{ key: string; label?: string, onDraw?: (item: any) => any }>;
    data: Array<{ [key: string]: string | number }>;
    customClassName?: string;
    tableClassName?: string;
    title: string;
    emptyTitle: string;
}

export default function SimpleTable({ columns, data, customClassName = '', title, emptyTitle, tableClassName = '' }: TableProps) {
    return (
        <div className={`rounded-md shadow-sm overflow-x-auto ${customClassName}`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 pl-4">
                {title}
            </h2>
            <div className={`relative max-h-[35vh] overflow-y-auto custom-scrollbar border rounded-lg ${tableClassName}`}>
                <table className={`min-w-full border-collapse bg-white shadow-2xl ${tableClassName}`}>
                    <thead className="sticky top-0 right-0">
                        <tr className="bg-gray-100 text-left text-sm leading-6 text-gray-900">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-2 border-b border-gray-300 font-semibold"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="text-gray-900 odd:bg-white even:bg-gray-50"
                            >
                                {columns.map((col) => {
                                    if(col.key) {
                                        return <td
                                            key={col.key}
                                            className="px-4 py-2 border-b border-gray-300 text-sm"
                                        >
                                            {col?.onDraw ? col.onDraw(row) : row[col.key]}
                                        </td>
                                    }
                                    if(col.onDraw) {
                                        return <td
                                            key={col.key}
                                            className="px-4 py-2 border-b border-gray-300 text-sm"
                                        >
                                            {col.onDraw(row)}
                                        </td>
                                    }
                                })}
                            </tr>
                        )) : <tr className="text-base font-semibold leading-6 text-gray-900/60 w-full text-center py-1">
                            <td>{emptyTitle}</td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
