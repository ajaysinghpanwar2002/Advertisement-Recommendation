import express, { Router } from 'express';
import ServiceController from '../controllers/ServiceController';

class ServiceRouter {
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.routes();
    }
    
    private routes() {
        this.router.get('/', ServiceController.ServiceProvider)
    }
    
    public getRouter(): Router {
        return this.router;
    }
}

export default new ServiceRouter().getRouter();
