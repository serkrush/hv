/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import {XMarkIcon} from '@heroicons/react/24/outline';
import ImageCropProvider from './CropComponents/ImageCropProvider';
import ImageCrop from './CropComponents/ImageCrop';
import {Modals} from '@/src/constants';

interface UploadImageProps {
    handleAddImage: any;
    handleDelImage: any;
    image: string;
    nameDialog: string;
}

export default function UploadImage({
    handleAddImage,
    image,
    handleDelImage,
    nameDialog,
}: UploadImageProps) {
    return (
        <div>
            {image ? (
                <div key={image} className="relative w-[100px]">
                    <button
                        type="button"
                        className="absolute right-0 hover:bg-gray-50"
                        onClick={() => {
                            handleDelImage();
                        }}>
                        <span className="sr-only">Close</span>
                        <XMarkIcon
                            className="h-4 w-4 shrink-0 text-red-600"
                            aria-hidden="true"
                        />
                    </button>
                    <img className="h-full w-full" src={image} />
                </div>
            ) : (
                <div>
                    <ImageCropProvider>
                        <ImageCrop
                            handleAddImage={handleAddImage}
                            nameDialog={nameDialog ?? Modals.CropDialog}
                        />
                    </ImageCropProvider>
                </div>
            )}
        </div>
    );
}
