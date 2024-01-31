import { Request, Response } from "express";
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';

class ClassificationController {
    async getClassification(req: Request, res: Response) {
        try {
            const imageBase64: string = req.body.image;
            const imageBuffer = Buffer.from(imageBase64, 'base64');

            // Complete path to the model.json file
            const modelPath = "C:\\Users\\Ajay singh\\Desktop\\adverie\\src\\services\\classification\\PreTrainedModels\\age\\model.json";

            // Load the model
            const model = await tf.loadLayersModel('file://' + modelPath);

            // Preprocess the image
            const imgTensor = tf.node.decodeImage(imageBuffer, 3); // Assuming RGB image
            const preprocessedImg = imgTensor.expandDims(0).div(255.0);

            // Make a prediction
            const prediction = model.predict(preprocessedImg) as tf.Tensor;

            // Get the result as a plain array
            const resultArray = prediction.arraySync();

            // You can send the result back to the frontend
            res.json({ prediction: resultArray });

        } catch (e) {
            console.error(e);
            res.status(500).send('Error in classification controller.');
        }
    }
}

export default new ClassificationController();
