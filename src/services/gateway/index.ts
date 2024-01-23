import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import proxy from 'express-http-proxy';

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
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    private routes() {
        this.app.use("/", proxy('http://localhost:3001')); // classification
        this.app.use("/recommendation", proxy('http://localhost:3002'));
    }

    private start() {
        this.app.listen(this.port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${this.port}`);
        });
    }
}

new Server();