import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { User } from '../models/user';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_REDIRECT_URI!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'accounts.providerAccountId': profile.id });
        if (!user) {
          user = new User({
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            image: profile.photos?.[0]?.value || '',
            accounts: [{
              provider: 'github',
              providerAccountId: profile.id,
              type: 'oauth',
              userId: profile.id,
            }],
          });
          await user.save();
        } else {
          // Update the user's account information if necessary
          const accountIndex = user.accounts.findIndex(account => account.providerAccountId === profile.id);
          if (accountIndex === -1) {
            user.accounts.push({
              provider: 'github',
              providerAccountId: profile.id,
              type: 'oauth',
              userId: profile.id,
            });
            await user.save();
          }
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export { passport };