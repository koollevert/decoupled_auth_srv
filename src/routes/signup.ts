import express, {Request, Response} from 'express';
import {body} from 'express-validator';
// import jwt, { Secret } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@selmathistckt/common';
const router = express.Router();

router.post('/api/auth/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min:4, max:20})
        .withMessage('Passsword must be between 4 and 20 characters'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
    ],
    validateRequest,
    async(req: Request, res: Response)=> {    //typo
        
        const { email, password, name }=req.body;

        const existingUser =await User.findOne({ email });

        if(existingUser){
            throw new BadRequestError('Email in use');
        }

        const user=User.build({email, password, name});
        await user.save();

        const userJwt=jwt.sign(
            {
                id: user.id,
                email:user.email,
            },
            process.env.JWT_KEY!
        );
        (req.session as any).jwt = userJwt;

        // req.session={
        //     jwt:userJwt
        // }as any; 

        res.status(201).send(user);
       
    }
);

export { router as signupRouter};