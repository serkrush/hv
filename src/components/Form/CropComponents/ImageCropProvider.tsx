import {
    createContext,
    useCallback,
    useContext,
    useState,
    ReactNode,
} from 'react';
import getCroppedImg, {CroppedImgResult} from './cropImage';

interface ImageCropContextType {
    image: string | null;
    setImage: (image: string | null) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    rotation: number;
    setRotation: (rotation: number) => void;
    crop: {x: number; y: number};
    setCrop: (crop: {x: number; y: number}) => void;
    croppedAreaPixels: any;
    setCroppedAreaPixels: (croppedAreaPixels: any) => void;
    onCropComplete: (_croppedArea: any, croppedAreaPixels: any) => void;
    getProcessedImage: () => Promise<File | undefined>;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleRotateCw: () => void;
    handleRotateAntiCw: () => void;
    resetStates: () => void;
    max_zoom: number;
    min_zoom: number;
    zoom_step: number;
    max_rotation: number;
    min_rotation: number;
    rotation_step: number;
}

const defaultImage = null;
const defaultCrop = {x: 0, y: 0};
const defaultRotation = 0;
const defaultZoom = 1;
const defaultCroppedAreaPixels = null;

const ImageCropContext = createContext<ImageCropContextType | undefined>(
    undefined,
);

interface ImageCropProviderProps {
    children: ReactNode;
    max_zoom?: number;
    min_zoom?: number;
    zoom_step?: number;
    max_rotation?: number;
    min_rotation?: number;
    rotation_step?: number;
}

const ImageCropProvider: React.FC<ImageCropProviderProps> = ({
    children,
    max_zoom = 3,
    min_zoom = 1,
    zoom_step = 0.1,
    max_rotation = 360,
    min_rotation = 0,
    rotation_step = 5,
}) => {
    const [image, setImage] = useState<string | null>(defaultImage);
    const [crop, setCrop] = useState(defaultCrop);
    const [rotation, setRotation] = useState(defaultRotation);
    const [zoom, setZoom] = useState(defaultZoom);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(
        defaultCroppedAreaPixels,
    );

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleZoomIn = () => {
        if (zoom < max_zoom) {
            setZoom(zoom + zoom_step * 2);
        }
    };

    const handleZoomOut = () => {
        if (zoom > min_zoom) {
            setZoom(zoom - zoom_step * 2);
        }
    };

    const handleRotateCw = () => {
        setRotation(rotation + rotation_step);
    };

    const handleRotateAntiCw = () => {
        setRotation(rotation - rotation_step);
    };

    const getProcessedImage = async () => {
        if (image && croppedAreaPixels) {
            const croppedImage: CroppedImgResult = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation,
            );
            const imageFile = new File(
                [croppedImage.file],
                `img-${Date.now()}.png`,
                {
                    type: 'image/png',
                },
            );
            return imageFile;
        }
    };

    const resetStates = () => {
        setImage(defaultImage);
        setCrop(defaultCrop);
        setRotation(defaultRotation);
        setZoom(defaultZoom);
        setCroppedAreaPixels(defaultCroppedAreaPixels);
    };

    return (
        <ImageCropContext.Provider
            value={{
                image,
                setImage,
                zoom,
                setZoom,
                rotation,
                setRotation,
                crop,
                setCrop,
                croppedAreaPixels,
                setCroppedAreaPixels,
                onCropComplete,
                getProcessedImage,
                handleZoomIn,
                handleZoomOut,
                handleRotateAntiCw,
                handleRotateCw,
                max_zoom,
                min_zoom,
                zoom_step,
                max_rotation,
                min_rotation,
                rotation_step,
                resetStates,
            }}>
            {children}
        </ImageCropContext.Provider>
    );
};

export const useImageCropContext = () => {
    const context = useContext<ImageCropContextType | undefined>(
        ImageCropContext,
    );
    if (!context) {
        throw new Error(
            'useImageCropContext must be used within an ImageCropProvider',
        );
    }
    return context;
};

export default ImageCropProvider;
