import React from 'react';
import { FaChevronRight, FaChevronLeft } from 'src/components/FaIcons/icons';

interface IMonthsNavProps {
    onPreviousClick: () => void;
    onNextClick: () => void;
}
export default function MonthsNav(props: IMonthsNavProps) {
    const { onPreviousClick, onNextClick } = props;
    
    return (
        <div className='w-full mt-6.5 absolute top-0 flex flex-row justify-between'>
            <button className='mx-2 text-gray-200 hover:text-gray-400 cursor-pointer transform hover:scale-110' type='button'
                onClick={() => onPreviousClick()}>
                <FaChevronLeft />
            </button>

            <button className='mx-2 text-gray-200 hover:text-gray-400 cursor-pointer transform hover:scale-110' type='button'
                onClick={() => onNextClick()}>
                <FaChevronRight />
            </button>

        </div>
    );
}