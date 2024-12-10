import ImageCropModalContent from './ImageCropModalContent';
import {readFile} from './cropImage';
import {useImageCropContext} from './ImageCropProvider';
import Modal from '../../Modal';
import {setFlagger} from '@/store/types/actionTypes';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

interface ImageCropProps {
    handleAddImage: any;
    nameDialog: string;
}

const ImageCrop = ({handleAddImage, nameDialog}: ImageCropProps) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const {getProcessedImage, setImage, resetStates} = useImageCropContext();

    const handleDone = async () => {
        const avatar = await getProcessedImage();
        const imageDataUrl = (await readFile(avatar)) as string;
        handleAddImage(imageDataUrl);
        resetStates();
        dispatch(setFlagger(nameDialog, null));
    };

    const handleFileChange = async ({target: {files}}) => {
        const file = files && files[0];
        const imageDataUrl = (await readFile(file)) as string;
        setImage(imageDataUrl);
        dispatch(setFlagger(nameDialog, {open: true}));
    };
    return (
        <div className="flex items-center">
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id={nameDialog}
                accept="image/*"
            />

            <label htmlFor={nameDialog} className="">
                <p className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    {t('upload-file')}
                </p>
            </label>

            <Modal flagId={nameDialog} className="sm:max-w-[400px]">
                <ImageCropModalContent
                    handleDone={handleDone}
                    handleClose={() => dispatch(setFlagger(nameDialog, null))}
                />
            </Modal>
        </div>
    );
};

export default ImageCrop;
