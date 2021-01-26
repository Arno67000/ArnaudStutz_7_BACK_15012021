import * as express from 'express';
import { login , signup, deleteUser } from '../controllers/user';
import { auth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';

export const userRouter = express.Router();

userRouter.post('/login', /*loginLimiter,*/ login);
userRouter.post('/signup', signup);
userRouter.delete('/:id', auth, deleteUser); 

