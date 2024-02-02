import { Request, Response } from "express";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import path from 'path';

class ClassificationController {
    async getClassification(req: Request, res: Response): Promise<void> {
        try {
            const imageBase64: string = req.body.image;
            const imageBuffer = Buffer.from(imageBase64, 'base64');

            const model = await this.loadModel();
            const processedImage = await this.processImage(imageBuffer);
            const prediction = await model.predict(processedImage);

            res.json({ prediction: prediction.dataSync()[0] }); // Assuming single-value prediction
        } catch (e) {
            console.error(e);
            res.status(500).send('Error in classification controller.');
        }
    }

    async loadModel(): Promise<tf.LayersModel> {
        try {
            const modelPath = path.join(__dirname, '../../preTrainedModels/age/model.json');
            console.log(modelPath);
            const model = await tf.loadLayersModel('file://' + modelPath);
            return model;
        } catch (error) {
            throw new Error(`Error loading model: ${error}`);
        }
    }

    async processImage(imageBuffer: Buffer): Promise<tf.Tensor3D> {
        try {
            const rawTensor = tf.node.decodeImage(imageBuffer, 3);
            const resizedTensor = tf.image.resizeBilinear(rawTensor, [150, 150]);
            const normalizedTensor = tf.div(resizedTensor, 255);
            return normalizedTensor;
        } catch (error) {
            throw new Error(`Error processing image: ${error}`);
        }
    }
}

export default new ClassificationController();
