import { Request, Response } from 'express';

class ServiceController {
    public async ServiceProvider(req: Request, res: Response) {
        try {
            res.send('service worker started');
        } catch (e) {
            console.log(e);
            res.status(500).send('Error in service controller.');
        }
    }
}

export default new ServiceController();
