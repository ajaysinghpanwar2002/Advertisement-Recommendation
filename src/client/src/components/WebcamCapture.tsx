import { useRef } from 'react';
import Webcam from "react-webcam";
import useInterval from '../hooks/useInterval';
import sendImage from '../utils/sendImage';

interface WebcamWithScreenshot extends Webcam {
    getScreenshot: () => string | null;
}

interface WebcamCaptureProps {
    onFacesDetected: (faces: Array<{ gender: string, Age: number }>) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onFacesDetected }) => {
    const webcamRef = useRef<WebcamWithScreenshot>(null);

    useInterval(() => {
        const imageSrc = webcamRef.current?.getScreenshot();//base64
        if (imageSrc) {
            sendImage(imageSrc)
                .then(data => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    onFacesDetected(data);
                })
                .catch(error => console.error(error));
        }
    }, 5000);

    return (
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
        />
    );
};

export default WebcamCapture;