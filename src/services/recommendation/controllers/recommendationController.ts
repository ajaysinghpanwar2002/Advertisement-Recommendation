import { Request, Response } from 'express';
import * as tf from '@tensorflow/tfjs-node';
import { User } from '../models/users';

class recommendationController {
    private model = tf.sequential();

    // Create the model
    private createModel() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 128, inputShape: [3] })); // Adjust to accept 3 features        this.model.add(tf.layers.dense({ units: 64 }));
        this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 2 }));

        this.model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });
    }

    // Create training data
    private createTrainingData() {
        const sampleData = [
            { age: 25, gender: 'Male', embeddingVector: [0.6, 0.4] },
            { age: 35, gender: 'Female', embeddingVector: [0.3, 0.7] },
            { age: 18, gender: 'Male', embeddingVector: [0.7, 0.3] },
            { age: 42, gender: 'Female', embeddingVector: [0.4, 0.6] },
            { age: 27, gender: 'Male', embeddingVector: [0.8, 0.2] },
            { age: 22, gender: 'Female', embeddingVector: [0.5, 0.5] },
            { age: 31, gender: 'Male', embeddingVector: [0.7, 0.3] },
            { age: 28, gender: 'Female', embeddingVector: [0.3, 0.7] },
            { age: 19, gender: 'Male', embeddingVector: [0.6, 0.4] },
            { age: 39, gender: 'Female', embeddingVector: [0.4, 0.6] },
        ];
        const X = sampleData.map(({ age, gender }) => {
            const genderOneHot = gender === 'Male' ? [1, 0] : [0, 1];
            return [age, ...genderOneHot];
        });
        const Y = sampleData.map(({ embeddingVector }) => embeddingVector);
        return { X, Y };
    }

    // Train the model
    private async trainModel(X: number[][], Y: number[][]) {
        await this.model.fit(tf.tensor2d(X), tf.tensor2d(Y), { epochs: 50, batchSize: 10 });
    }

    // Get the recommended class, simply go to line 118
    private async getRecommendedClass(age: number, gender: string) {
        const recommendedClass = await this.recommendAdvertisementClass({ age, gender });
        return recommendedClass;
    }

    private getUserEmbedding(age: any, gender: any) {
        const userTensor = tf.tensor2d([[age, gender]]);
        const prediction = this.model.predict(userTensor);
        if (Array.isArray(prediction)) {
            return prediction.map(tensor => tensor.dataSync());
        } else {
            return prediction.dataSync();
        }
    }

    private calculateUserSimilarityUsingCosineSimilarity(newUser: any, existingUser: any) {
        const newUserEmbedding = Array.from(this.getUserEmbedding(newUser.age, newUser.gender) as Float32Array);
        const existingUserEmbedding = Array.from(this.getUserEmbedding(existingUser.age, existingUser.gender) as Float32Array);

        const similarity = tf.metrics.cosineProximity(
            tf.tensor1d(newUserEmbedding),
            tf.tensor1d(existingUserEmbedding)
        ).dataSync()[0];

        return similarity;
    }

    public async recommendationProvider(req: Request, res: Response) {
        try {
            const { age, gender } = req.body;
            this.createModel();
            const { X, Y } = this.createTrainingData();
            await this.trainModel(X, Y);
            const recommendedClass = await this.getRecommendedClass(age, gender);

            res.status(200).json(recommendedClass);
        } catch (e) {
            console.log(e);
            res.status(500).send('Error in recommendation controller.');
        }
    }

    // calculate the similarity between the new user and all existing users
    private async calculateUserSimilarities(newUser: any) {
        const userSimilarities = [];
        const existingUsers = await User.find();
        for (const existingUser of existingUsers) {
            const similarity = this.calculateUserSimilarityUsingCosineSimilarity(newUser, existingUser);
            userSimilarities.push({ user: existingUser, similarity });
        }
        return userSimilarities;
    }

    // get the top 5 similar users
    private getTopSimilarUsers(userSimilarities: any[]) {
        userSimilarities.sort((a, b) => b.similarity - a.similarity);
        return userSimilarities.slice(0, 5); // Top 5 similar users
    }

    // get the advertisement class counts for the top 5 similar users
    private getAdvertisementClassCounts(topSimilarUsers: any[]) {
        const advertisementClassCounts: { [key: string]: number } = {};
        for (const { user } of topSimilarUsers) {
            for (const { advertisement_class, time_duration } of user.advertisement_interactions) {
                if (advertisementClassCounts[advertisement_class]) {
                    advertisementClassCounts[advertisement_class] += time_duration;
                } else {
                    advertisementClassCounts[advertisement_class] = time_duration;
                }
            }
        }
        return advertisementClassCounts;
    }

    // recomended class based on the top 5 similar users
    private async recommendAdvertisementClass(newUser: any) {
        const userSimilarities = await this.calculateUserSimilarities(newUser);
        const topSimilarUsers = this.getTopSimilarUsers(userSimilarities);
        const advertisementClassCounts = this.getAdvertisementClassCounts(topSimilarUsers);

        let recommendedClass = null;
        if (Object.keys(advertisementClassCounts).length > 0) {
            recommendedClass = Object.keys(advertisementClassCounts).reduce((a, b) =>
                advertisementClassCounts[a] > advertisementClassCounts[b] ? a : b
            );
        }
        console.log("recommended class",recommendedClass);
        return { advertisement_class: recommendedClass };
    }
}

export default recommendationController;