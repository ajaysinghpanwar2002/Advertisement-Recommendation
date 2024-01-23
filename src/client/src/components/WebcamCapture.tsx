import { useRef } from 'react';
import Webcam from "react-webcam";
import useInterval from '../hooks/useInterval';
import sendImage from '../utils/sendImage';

interface WebcamWithScreenshot extends Webcam {
    getScreenshot: () => string | null;
}

const WebcamCapture: React.FC = () => {
    const webcamRef = useRef<WebcamWithScreenshot>(null);

    useInterval(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            sendImage(imageSrc);
            console.log('Image sent', imageSrc);
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