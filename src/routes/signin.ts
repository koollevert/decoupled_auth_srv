import express, {Request, Response} from 'express';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { Password } from '../services/password';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@selmathistckt/common';
const router = express.Router();
router.post('/api/auth/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim() 
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request, res: Response)=> {
        const { email, password}=req.body;

        const existingUser= await User.findOne({email});
        if(!existingUser){
            throw new BadRequestError('Invalid credentials');
        }

        // Use optional chaining to safely check the password
        const passwordsMatch = existingUser.password ? await Password.compare(existingUser.password, password) : false
        
        if(!passwordsMatch){
            throw new BadRequestError('Invalid Credentials')
        }
        const userJwt=jwt.sign(
            {
                id: existingUser.id,
                email:existingUser.email,
            },
            process.env.JWT_KEY!
        );
        (req.session as any).jwt = userJwt;
        

        res.status(200).send(existingUser)
    }
);

export { router as signinRouter};
