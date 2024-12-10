import {useTranslation} from 'react-i18next';
import Cropper from './Cropper';
import {ZoomSlider} from './Sliders';

const ImageCropModalContent = ({handleDone, handleClose}) => {
    const {t} = useTranslation();
    return (
        <div className="relative text-center">
            <div className="flex flex-col rounded-lg border border-dashed border-gray-200 p-6">
                <div className="flex justify-center">
                    <div className="crop-container mb-4">
                        <Cropper />
                    </div>
                </div>

                <div>
                    <ZoomSlider className="mb-4" />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-2 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleDone}
                        className="mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModalContent;
