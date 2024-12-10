import BaseClientContext from 'src/di/baseClientContext';
import {ToastOptions, toast} from 'react-toastify';

export default class ToastEmitter extends BaseClientContext {
    private defaultMessageParams: ToastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
    };

    private defaultErrorParams: ToastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
    };

    public message(message: string, params?: ToastOptions, isTranslated: boolean = false) {
        const {t} = this.di;
        const translatedMessage = isTranslated ? message : t(message); 
        toast(
            translatedMessage,
            params == null || params == undefined
                ? this.defaultMessageParams
                : params,
        );
    }

    public errorMessage(message: string, params?: ToastOptions, isTranslated: boolean = false) {
        const {t} = this.di;
        const translatedMessage = isTranslated ? message : t(message); 
        toast.error(
            translatedMessage,
            params == null || params == undefined
                ? this.defaultErrorParams
                : params,
        );
    }
}
