import express, { Router } from 'express';
import RecommendationController from '../controllers/recommendationController';
import bodyParser from 'body-parser';

class RecommendationRouter {
    private router: Router;
    private recommendationController: RecommendationController;

    constructor() {
        this.router = express.Router();
        this.recommendationController = new RecommendationController();
        this.routes();
    }

    private routes() {
        this.router.post('/', bodyParser.json(), this.recommendationController.recommendationProvider.bind(this.recommendationController));
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new RecommendationRouter().getRouter();