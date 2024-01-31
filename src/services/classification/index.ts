import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import Database from './db';
import { ServiceRouter, UserRouter, classficationRouter } from './routes';

dotenv.config();

class Server {
    private app: Express;
    private port: string | number;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;
        this.config();
        this.routes();
        this.start();
    }

    private async config() {
        const database = Database.getInstance();
        const db = await database.getConnectedDb();
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.locals.db = db;
    }

    private routes() {
        this.app.use("/", ServiceRouter);
        this.app.use("/users", UserRouter);
        this.app.use("/classification", classficationRouter);
    }

    private start() {
        this.app.listen(this.port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${this.port}`);
        });
    }
}

new Server();