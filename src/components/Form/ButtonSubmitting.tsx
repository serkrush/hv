import ContainerContext from '@/src/ContainerContext';
import {FaSpinner} from '../FaIcons/icons';
import {useContext, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState, RequestStatus} from '@/src/constants';

type ButtonSubmittingType = {
    entityName: string;
    translationLabel: string;
    actionType: string;
    onClick?: (...args: any) => void;
    type?: 'button' | 'submit';
    colorClassNames?: string;
    disabled?: boolean;
};

export const ButtonSubmitting = ({
    entityName,
    actionType,
    translationLabel,
    onClick = () => {},
    type = 'submit',
    colorClassNames = 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-400 disabled:hover:bg-indigo-400',
    disabled = false,
}: ButtonSubmittingType) => {
    const di = useContext(ContainerContext);
    const t = di.resolve('t');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const requestStatuses = useSelector(
        (state: AppState) => state.requestStatus,
    );
    useEffect(() => {
        const requestData = requestStatuses[entityName];
        if (requestData) {
            if (requestData.status === RequestStatus.LOADING) {
                if (requestData.actionType === actionType) {
                    setIsSubmitting(true);
                } else {
                    setIsDisabled(true);
                }
            } else if (
                requestData.status === RequestStatus.SUCCESS ||
                requestData.status === RequestStatus.ERROR
            ) {
                if (requestData.actionType === actionType) {
                    setIsSubmitting(false);
                } else {
                    setIsDisabled(false);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestStatuses]);

    const getLabel = () => {
        if (isSubmitting)
            return (
                <span className="flex items-center justify-center gap-3">
                    <FaSpinner className="h-6 w-6 animate-spin text-white" />
                    {t('processing')}
                </span>
            );
        else return t(translationLabel);
    };
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={isDisabled || isSubmitting || disabled}
            className={`flex h-full w-full items-center justify-center rounded-md px-3 py-1.5 font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${colorClassNames}`}>
            {getLabel()}
        </button>
    );
};
