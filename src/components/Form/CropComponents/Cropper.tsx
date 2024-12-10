import EasyCropper from 'react-easy-crop';
import {useImageCropContext} from './ImageCropProvider';

const Cropper = () => {
    const {image, zoom, setZoom, rotation, crop, setCrop, onCropComplete} =
        useImageCropContext();

    return (
        <EasyCropper
            image={image || undefined}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={3 / 4}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={false}
            style={{
                containerStyle: {
                    height: 220,
                    width: 220,
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                },
            }}
        />
    );
};

export default Cropper;
