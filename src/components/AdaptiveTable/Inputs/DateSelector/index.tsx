// import '../_inputs.scss';
import 'react-day-picker/lib/style.css';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FaCalendarAlt } from 'src/components/FaIcons/icons';
import { FilterType, RangeDate } from 'src/pagination/IPagerParams';
import MomentLocaleUtils from 'react-day-picker/moment';
import DayPicker, { DateUtils } from 'react-day-picker';
import moment from 'moment-timezone';
import {useTranslation} from 'react-i18next';
import { clickOutSideTheBlock } from 'src/utils/random';
import DateInput from './DateInput';
import MonthsNav from './MonthsNav';

interface IInputProps {
    name: string;
    value?: RangeDate | any;
    type?: FilterType;
    onChange?: (name: string, value: any) => void;
}
export default function DateSelector(props: IInputProps){
    const { name, value, type, onChange } = props;
    const { t, i18n: { language: locale } } = useTranslation('common');
    
    const isSingleDate = useMemo(() => type === FilterType.SingleDate, [type]);
    const numberOfMonths = useMemo(() => isSingleDate? 1 : 2, [isSingleDate]);
    const DATE_RANGE_SELECTOR_ID = useMemo(() => `DateRangeSelectorId_${name}`, [name]);

    const makeFromTo = useCallback((from, to) => Object({ from, to }), []);
    const makeRange = useCallback((day, range) => DateUtils.isDayInRange(day, range)? range : DateUtils.addDayToRange(day, range), []);

    const getInitialRangeState = useCallback(() => {
        if(isSingleDate){
            const date = value? moment(value).toDate() : undefined;
            return makeFromTo(date, date);
        }else {
            const range: RangeDate = value as RangeDate;
            const from = range?.startDate, to = range?.endDate;
            
            return makeFromTo(from? moment(from).toDate() : undefined, to? moment(to).toDate() : undefined);
        }
    }, [isSingleDate, makeFromTo, value]);

    const [selectedDays, setSelectedDays] = useState(makeFromTo(undefined, undefined));
    const [showCalendars, setShowCalendars] = useState(false);
    const [refDayPicker, setRefDayPicker] = useState<DayPicker>(null);

    const [from, to] = useMemo(() => [selectedDays.from, selectedDays.to], [selectedDays.from, selectedDays.to]);

    const sendChanges = useCallback((range: any) => {
        const {from, to} = range;

        if(from && to){
            if(isSingleDate && from === to){
                onChange(name, moment(to).unix() * 1000);
            }else {
                onChange(name, {
                    startDate: moment(from).unix() * 1000,
                    endDate: moment(to).unix() * 1000,
                });
            }
        }
    }, [isSingleDate, name, onChange]);

    const setSelectedRange = useCallback((range: any, day: any) => {
        if(isSingleDate){ range = makeFromTo(day, day); }
        
        setSelectedDays(range);
        sendChanges(range);
    }, [isSingleDate, makeFromTo, sendChanges]);
    
    const dayChangeHandler = useCallback((day) => {
        const range = DateUtils.addDayToRange(day, selectedDays);
        setSelectedRange(range, day);
    }, [selectedDays, setSelectedRange]);
    
    const startDayChangeHandler = useCallback((day) => {
        let lastDayRange = makeFromTo(selectedDays.to, selectedDays.to);
        if(isSingleDate) {
            lastDayRange = makeFromTo(day, day);
        }
        const range = makeRange(day, lastDayRange);

        refDayPicker.showMonth(range.from);
        setSelectedRange(range, day);
    }, [isSingleDate, makeFromTo, makeRange, refDayPicker, selectedDays, setSelectedRange]);

    const endDayChangeHandler = useCallback((day) => {
        const firstDayRange = makeFromTo(selectedDays.from, selectedDays.from);
        const range = makeRange(day, firstDayRange);
        const focusMonth = range.to? range.to : range.from;

        refDayPicker?.showMonth(focusMonth);
        setSelectedRange(range, day);
    }, [makeFromTo, selectedDays.from, makeRange, refDayPicker, setSelectedRange]);

    const openCalendars = useCallback(() => setShowCalendars(true), []);

    const windowClickDateRange = useCallback((event: any) => {
        (showCalendars && !clickOutSideTheBlock(event, DATE_RANGE_SELECTOR_ID)) && setShowCalendars(false);
    }, [DATE_RANGE_SELECTOR_ID, showCalendars]);

    useEffect(() => {
        window.addEventListener('click', windowClickDateRange);
        setSelectedDays(getInitialRangeState());

        return () => {
            window.removeEventListener('click', windowClickDateRange);
        };
    }, [getInitialRangeState, windowClickDateRange]);

    const placeholder= useMemo(() => isSingleDate? t('select-date') : t('select-date-range'), [isSingleDate, t]);
    const modifiers = useMemo(() => Object({start: from, end: to}), [from, to]);    
     
    return(
        <div id={DATE_RANGE_SELECTOR_ID} onClick={openCalendars}
            className='h-7 relative filterItem'>
            
            <div className='w-full h-full flex flex-row rounded-md overflow-hidden'>
                <div className='w-7 h-full flex justify-center items-center border-0 border-r border-gray-100 focus-within:border-yellow-600 rounded-l-md'>
                    {/* @ts-ignore */}
                    <FaCalendarAlt className='text-sm text-gray-400' />
                </div>
                
                <div className='w-full flex flex-row justify-center'>
                    {/* @ts-ignore */}
                    <DateInput placeholder={placeholder}
                        value={selectedDays.from}
                        onDayChange={startDayChangeHandler}/>

                    {!isSingleDate && (
                        <>
                            <div className='flex justify-center items-center'>
                                <span> — </span>
                            </div>

                            {/* @ts-ignore */}
                            <DateInput placeholder={placeholder}
                                value={selectedDays.to}
                                onDayChange={endDayChangeHandler}/>
                        </>
                    )}
                </div>
            </div>
            
            { showCalendars && (
                <div className='mt-7 absolute top-0 left-0 z-50 rounded-md bg-white shadow-2xl'>
                    {/* @ts-ignore */}
                    <DayPicker
                        ref={setRefDayPicker}
                        className="Selectable"
                        numberOfMonths={numberOfMonths}
                        selectedDays={[from, { from, to }]}
                        modifiers={modifiers}
                        localeUtils={MomentLocaleUtils}
                        locale={locale}
                        onDayClick={dayChangeHandler}
                        navbarElement={MonthsNav}/>
                </div>
            )}
        </div>
    );
}