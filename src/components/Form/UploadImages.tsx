/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import {XMarkIcon} from '@heroicons/react/24/outline';
import ImageCropProvider from './CropComponents/ImageCropProvider';
import ImageCrop from './CropComponents/ImageCrop';
import { Modals } from '@/src/constants';

interface UploadImagesProps {
    handleAddImage: any;
    handleDelImage: any;
    images: string[];
}

export default function UploadImages({
    handleAddImage,
    images,
    handleDelImage,
}: UploadImagesProps) {
    return (
        <div>
            <div className="grid grid-cols-6 gap-x-2">
                {images &&
                    images.length > 0 &&
                    images.map((image, index) => (
                        <div key={image} className="relative">
                            <button
                                type="button"
                                className="absolute right-0 hover:bg-gray-50"
                                onClick={() => {
                                    handleDelImage(index);
                                }}>
                                <span className="sr-only">Close</span>
                                <XMarkIcon
                                    className="h-4 w-4 shrink-0 text-red-600"
                                    aria-hidden="true"
                                />
                            </button>
                            <img className="h-full w-full" src={image} />
                        </div>
                    ))}
                <div>
                    <ImageCropProvider>
                        <ImageCrop handleAddImage={handleAddImage} nameDialog={Modals.CropDialog} />
                    </ImageCropProvider>
                </div>
            </div>
        </div>
    );
}
