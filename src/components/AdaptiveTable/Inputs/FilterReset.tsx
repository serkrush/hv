// import './_inputs.scss';
import React, { useCallback } from 'react';
import { FaUndo } from 'src/components/FaIcons/icons';
import {useTranslation} from 'react-i18next';

interface IInputProps {
    name: string;
    onChange?: (name: string, emptyFilter: any) => void;
}

export default function FilterReset(props: IInputProps){
    const { name, onChange } = props;
    const { t } = useTranslation(['common']);
    
    const handleChange = useCallback((e: any) => {
        onChange(name, {});
    }, [name, onChange]);

    return(
        <div>
            <button className='btn btn-sm btn-primary' onClick={handleChange}>
                <p className='mr-3 whitespace-nowrap'> { t('reset-filters') } </p>
                <FaUndo />
            </button>
        </div>
    );
}