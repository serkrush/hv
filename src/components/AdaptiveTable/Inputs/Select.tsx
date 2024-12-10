// import './_inputs.scss';
import React, { useState, useCallback } from 'react';
import { IOptions } from 'src/pagination/IPagerParams';

interface ISelectProps {
    name: string;
    className?: string;
    value?: string;
    items: IOptions[];
    onChange: (name: string, value: string) => void;
}
export default function Select(props: ISelectProps){
    const { value, items, name, onChange, className } = props;
    const [selectedOption, setSelected] = useState(value);
    
    const handleChange = useCallback((e) => {
        setSelected(e.target.value);
        onChange(e.target.name, e.target.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[name, onChange]);

    return(
        <div className='w-full'>
            {
                Array.isArray(items) && items.length > 0 ? (
                    <select
                        id={name}
                        name={name}
                        value={selectedOption}
                        onChange={handleChange}
                        className={className}>

                        {items.map(item => {
                            return (
                                <option key={'adaptive-table-select-option-' + item.value} value={item.value}>
                                    {item.label}
                                </option>
                            );
                        })}
                    
                    </select>) : null
            }
            
        </div> 
    );
}