import { Request, Response } from 'express';
import * as tf from '@tensorflow/tfjs-node';
import { User } from '../models/users';
import { faker } from '@faker-js/faker';

class recommendationController {
    private model = tf.sequential();
    private isModelTrained = false;
    private isDemoUserDatabasePopulated = false;

    constructor() {
        this.populateDemoUserDatabase();
        this.trainModelOnce();
    }

    private async populateDemoUserDatabase() {
        if (!this.isDemoUserDatabasePopulated) {
            await this.insertDemoUserDatabase();
            this.isDemoUserDatabasePopulated = true;
        }
    }

    private async trainModelOnce() {
        if (!this.isModelTrained) {
            this.createModel();
            const { X, Y } = this.createTrainingData();
            await this.trainModel(X, Y);
            this.isModelTrained = true;
        }
    }

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
        //const sampleTrainingData = [
        //    { age: 25, gender: 'Male', embeddingVector: [0.6, 0.4] },
        //    { age: 35, gender: 'Female', embeddingVector: [0.3, 0.7] },
        //    { age: 18, gender: 'Male', embeddingVector: [0.7, 0.3] },
        //    { age: 42, gender: 'Female', embeddingVector: [0.4, 0.6] },
        //    { age: 27, gender: 'Male', embeddingVector: [0.8, 0.2] },
        //    { age: 22, gender: 'Female', embeddingVector: [0.5, 0.5] },
        //    { age: 31, gender: 'Male', embeddingVector: [0.7, 0.3] },
        //    { age: 28, gender: 'Female', embeddingVector: [0.3, 0.7] },
        //    { age: 19, gender: 'Male', embeddingVector: [0.6, 0.4] },
        //    { age: 39, gender: 'Female', embeddingVector: [0.4, 0.6] },
        //];

        const sampleTrainingData = this.generateSyntheticUserDataModelTraining(50);

        const X = sampleTrainingData.map(({ age, gender }) => {
            const genderOneHot = gender === 'Male' ? [1, 0] : [0, 1];
            return [age, ...genderOneHot];
        });
        const Y = sampleTrainingData.map(({ embeddingVector }) => embeddingVector);
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
        const genderOneHot = gender === 'Male' ? [1, 0] : [0, 1];
        const userTensor = tf.tensor2d([[age, ...genderOneHot]]);
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
        console.log("recommended class", recommendedClass);
        return { advertisement_class: recommendedClass };
    }

    private async insertDemoUserDatabase() {
        const sampleUserData = [
            {
                age: 25,
                gender: 'Male',
                advertisement_interactions: [
                    { advertisement_class: 'Technology', time_duration: 120 },
                    { advertisement_class: 'Shopping', time_duration: 90 },
                ],
            },
            {
                age: 35,
                gender: 'Female',
                advertisement_interactions: [
                    { advertisement_class: 'Entertainment', time_duration: 180 },
                    { advertisement_class: 'Travel', time_duration: 150 },
                ],
            },
            {
                age: 18,
                gender: 'Male',
                advertisement_interactions: [
                    { advertisement_class: 'Technology', time_duration: 60 },
                    { advertisement_class: 'Entertainment', time_duration: 45 },
                ],
            },
            {
                age: 42,
                gender: 'Female',
                advertisement_interactions: [
                    { advertisement_class: 'Health and Wellness', time_duration: 90 },
                    { advertisement_class: 'Travel', time_duration: 120 },
                ],
            },
            {
                age: 27,
                gender: 'Male',
                advertisement_interactions: [
                    { advertisement_class: 'Automotive', time_duration: 75 },
                    { advertisement_class: 'Shopping', time_duration: 60 },
                ],
            },
            {
                age: 22,
                gender: 'Female',
                advertisement_interactions: [
                    { advertisement_class: 'Entertainment', time_duration: 120 },
                    { advertisement_class: 'Food and Beverage', time_duration: 90 },
                ],
            },
            {
                age: 31,
                gender: 'Male',
                advertisement_interactions: [
                    { advertisement_class: 'Financial Services', time_duration: 105 },
                    { advertisement_class: 'Home and Real Estate', time_duration: 75 },
                ],
            },
            {
                age: 28,
                gender: 'Female',
                advertisement_interactions: [
                    { advertisement_class: 'Travel', time_duration: 135 },
                    { advertisement_class: 'Services', time_duration: 90 },
                ],
            },
            {
                age: 19,
                gender: 'Male',
                advertisement_interactions: [
                    { advertisement_class: 'Education', time_duration: 60 },
                    { advertisement_class: 'Non-Profit and Social Causes', time_duration: 45 },
                ],
            },
            {
                age: 39,
                gender: 'Female',
                advertisement_interactions: [
                    { advertisement_class: 'Health and Wellness', time_duration: 120 },
                    { advertisement_class: 'Financial Services', time_duration: 90 },
                ],
            },
        ];

        await User.insertMany(sampleUserData);
    }

    private generateSyntheticUserDataModelTraining(count: number) {
        const data = [];
        for (let i = 0; i < count; i++) {
            const age = faker.number.int({ min: 18, max: 65 });
            const gender = faker.person.gender();
            const embeddingVector = [faker.number.int({ min: 0, max: 1 }), faker.number.int({ min: 0, max: 1 })];
            data.push({ age, gender, embeddingVector });
        }
        return data;
    }
}

export default recommendationController;