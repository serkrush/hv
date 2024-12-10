import * as React from "react";
import { useTranslation } from "react-i18next";
import { AppState, Modals } from "@/src/constants";
import { useDispatch, useSelector } from "react-redux";
import { setFlagger } from "@/store/types/actionTypes";
import Modal from "./Modal";

interface DialogProps {
  onOkAction: (data: any) => void;
  flagerKey: string;
  title: string;
}

function ConfirmationDialog(props: DialogProps) {
    const data = useSelector(
        (state: AppState) => state.flagger[props.flagerKey]
    );
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(setFlagger(props.flagerKey, null));
    };

    const handleDelete = () => {
        props.onOkAction(data);
        dispatch(setFlagger(props.flagerKey, null));
    };

    return (
        <Modal flagId={props.flagerKey} className="sm:max-w-[300px]">
            <div className="w-full">
                <div className="text-black">{props.title}</div>
                <div className="flex">
                    <button
                        className="mr-2 mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={handleClose}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        className="ml-2 mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={handleDelete}
                    >
                        {t("delete")}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmationDialog;
