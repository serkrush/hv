import React, {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {useDispatch, useSelector} from 'react-redux';
import {setFlagger} from '@/store/types/actionTypes';
import {isFunction} from '@/server/utils/isEmpty';
import {AppState} from '@/src/constants';

interface ModalProps {
    flagId: string;
    children: React.ReactNode;
    className?: string;
    actionClose?: () => void;
}

function Modal({flagId, children, className, actionClose = undefined}: ModalProps) {
    const dispatch = useDispatch();
    const data: any = useSelector((state: AppState) => state.flagger[flagId]);

    const handleClose = () => {
        dispatch(setFlagger(flagId, null));
        setFlagger(flagId, null);
        if (actionClose && isFunction(actionClose)) {
            actionClose();
        }
    };

    return (
        <Transition.Root show={!!data} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                            <Dialog.Panel
                                className={`relative flex transform justify-center overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6 ${className}`}>
                                <div className="absolute right-0 top-0 hidden pr-1 pt-1 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={handleClose}>
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon
                                            className="h-6 w-6 shrink-0 text-gray-600"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

export default Modal;
