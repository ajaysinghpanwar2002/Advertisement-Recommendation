import express, { Router } from 'express';
import classficationController from '../controllers/classficationController';
import bodyParser from 'body-parser';

class classFicationRouter {
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.routes();
    }

    private routes() {
        this.router.post('/', bodyParser.json(), classficationController.getClassification);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new classFicationRouter().getRouter();