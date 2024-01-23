import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    private static instance: Database;
    private connection: Connection | null = null;
    private mongoURI: string;

    private constructor() {
        this.mongoURI = process.env.DATABASE_URL as string;
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async getConnectedDb(): Promise<Connection> {
        if (!this.connection) {
            try {
                await mongoose.connect(String(this.mongoURI));
                this.connection = mongoose.connection;
                console.log('Connected to MongoDB server');
            } catch (error) {
                console.error('Error connecting to MongoDB:', error);
                throw error;
            }
        }

        if (!this.connection) {
            throw new Error('Database connection not established');
        }

        return this.connection;
    }
}

export default Database;