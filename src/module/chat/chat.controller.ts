import { Router } from 'express'
import { authenticate } from '../../common/middleware/authenticate.js';
import chatServices from './chat.service.js';

const chatRouter: Router = Router()

chatRouter.get('/',authenticate,chatServices.getChat);


export default chatRouter;
