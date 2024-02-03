import fs from 'fs';
import process from 'process';
import path, { resolve } from 'path';
import { Request, Response } from "express";
import * as tf from '@tensorflow/tfjs-node';
import * as faceapi from '@vladmandic/face-api';

class ClassificationController {
    //@ts-ignore
    private model: tf.LayersModel;
    minconfidence = 0.15;
    minResults = 5;

    constructor() {
        this.loadModels();
        this.getClassification = this.getClassification.bind(this);
    }

    private async generateTensorFromBuffer(buffer: any) {
        if (buffer.length === 0) {
            return null;
        }
        const tensor = tf.tidy(() => {
            const decoded = tf.node.decodeImage(buffer, 3);
            let expand;
            if (decoded.shape[2] === 4) {
                const channels = tf.split(decoded, 4, 2); // split rgba to channels
                const rgb = tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
                expand = tf.reshape(rgb, [1, decoded.shape[0], decoded.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
            } else {
                expand = tf.expandDims(decoded, 0);
            }
            const cast = tf.cast(expand, 'float32');
            return cast;
        })
        return tensor;
    }

    private async detect(tensor: tf.Tensor) { 
        try {
            const result = await faceapi.detectAllFaces(tensor as any, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();// problem is here
            return result;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    private async loadModels() {
        console.log("Loading FaceAPI models");
        const modelPath = path.join(__dirname, '../../preTrainedModel');
        await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
        console.log("Loaded models successfully.");
    }

    private print(face: any) {
        const gender = face.gender;
        const Age = Math.round(10 * face.age) / 10;
        console.log(gender, Age);
    }

    public async getClassification(req: Request, res: Response): Promise<void> {
        try {
            const imageBase64: string = req.body.image;
            // Remove the data URL scheme if it's present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            // Convert the base64 string back to binary data
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const tensor = await this.generateTensorFromBuffer(imageBuffer);

            if (tensor) {
                const result = await this.detect(tensor);
                for (const face of result) this.print(face);
                tensor.dispose();
            }

        } catch (e) {
            console.error(e);
            res.status(500).send('Error in classification controller.');
        }
    }
}

export default new ClassificationController();