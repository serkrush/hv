/* eslint-disable @next/next/no-img-element */
import noimage from '@/public/no-image.png';
import {getDownloadURL, getStorage, ref} from 'firebase/storage';
import {useEffect, useState} from 'react';
import {XMarkIcon} from '@heroicons/react/24/outline';

interface ImageStoreProps {
    name: string;
    folder: string;
    handleDelImage?: (name: string) => void;
}

export default function ImageStore({
    folder,
    name,
    handleDelImage,
}: ImageStoreProps) {
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const storage = getStorage();
                const storageRef = ref(
                    storage,
                    folder ? `${folder}/${name}` : name,
                );
                const url = await getDownloadURL(storageRef);
                setImageUrl(url);
            } catch (error) {
                console.error('Error fetching image URL: ', error);
            }
        };

        fetchImageUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);
    return (
        <div className="relative">
            {handleDelImage && (
                <button
                    type="button"
                    className="absolute right-0 hover:bg-gray-50"
                    onClick={() => {
                        handleDelImage(name);
                    }}>
                    <span className="sr-only">Close</span>
                    <XMarkIcon
                        className="h-4 w-4 shrink-0 text-red-600"
                        aria-hidden="true"
                    />
                </button>
            )}
            <>
                {imageUrl ? (
                    <img
                        className="mx-auto h-full w-full"
                        src={imageUrl}
                        alt="Uploaded"
                    />
                ) : (
                    <img
                        className="mx-auto h-full w-full"
                        src={noimage.src}
                        alt="no image"
                    />
                )}
            </>
        </div>
    );
}
