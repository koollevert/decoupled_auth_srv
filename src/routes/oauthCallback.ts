import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, UserDoc } from '../models/user';

const router = express.Router();

// GitHub OAuth routes
router.get('/auth/github', (req, res, next) => {
  const redirectUri = req.query.redirect_uri;
  passport.authenticate('github', {
    state: JSON.stringify({ redirectUri }),
  })(req, res, next);
});

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  async (req, res) => {
    const { redirectUri } = JSON.parse(req.query.state as string);

    const user=req.user as UserDoc;

    // Successful authentication, issue JWT and redirect to client
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    // Redirect to client with JWT
    const redirectUrl = `${redirectUri}?token=${userJwt}`;
    res.redirect(redirectUrl);
  } 
);

export { router as oauthCallbackRouter };


//error handler?