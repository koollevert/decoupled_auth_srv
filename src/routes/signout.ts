import express from 'express';

const router = express.Router();
router.post('/api/auth/signout', (req, res)=> {
    (req.session as any) = null;
    res.send({});
   
});

export { router as signoutRouter};