import * as React from 'react';
import {useTranslation} from 'react-i18next';
import Modal from './Modal';
import {AppState, Modals} from '@/src/constants';
import {useDispatch, useSelector} from 'react-redux';
import {setFlagger} from '@/store/types/actionTypes';

interface DialogProps {
    onDeleteFile: (name: string) => void;
}

function DeleteFileModal(props: DialogProps) {
    const name = useSelector(
        (state: AppState) => state.flagger[Modals.DeleteFileDialog],
    );
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(setFlagger(Modals.DeleteFileDialog, null));
    };

    const handleDelete = () => {
        props.onDeleteFile(name);
        dispatch(setFlagger(Modals.DeleteFileDialog, null));
    };

    return (
        <Modal flagId={Modals.DeleteFileDialog} className="sm:max-w-[300px]">
            <div className="w-full">
                <div>{t('delete-file')}</div>
                <div className="flex">
                    <button
                        className="mr-2 mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={handleClose}>
                        {t('cancel')}
                    </button>
                    <button
                        className="ml-2 mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={handleDelete}>
                        {t('delete')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteFileModal;
