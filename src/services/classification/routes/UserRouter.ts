import express, { Router } from 'express';
import userController from '../controllers/UserController';

class UserRouter {
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', userController.getUsers);
        this.router.post('/', userController.createUser);
        this.router.put('/:id', userController.updateUser);
        this.router.delete('/:id', userController.deleteUser);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new UserRouter().getRouter();