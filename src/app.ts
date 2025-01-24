import express from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors'; // Import the cors package

import { errorHandler, NotFoundError } from '@selmathistckt/common';

import { currentUserRouter } from './routes/session';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { oauthCallbackRouter } from './routes/oauthCallback';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
const corsOptions = {
  origin: '*', // Replace with the URL of your frontend (e.g., Next.js app)
  credentials: true,  // Allow cookies to be sent with the request
};

// Use the cors middleware to accept requests from anywhere
app.use(cors(corsOptions));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(oauthCallbackRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
