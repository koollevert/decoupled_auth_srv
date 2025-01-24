import express from 'express';

import { currentUser } from '@selmathistckt/common';

interface CustomSessionData {
    jwt?: string; // or whatever the type of your jwt property is
  }
  
  declare module 'express-session' {
    interface SessionData extends CustomSessionData {}
  }  

const router = express.Router();

router.get('/api/auth/session', currentUser, (req, res)=> {
    console.log('Headers:', req.headers);
    console.log(req.currentUser)
    res.send( {currentUser: req.currentUser || null}); 
  
});

export { router as currentUserRouter};
