# Passport-Draugiem

[Passport](http://passportjs.org/) strategy for authenticating with [Draugiem](http://www.draugiem.lv/)

By plugging into Passport, Draugiem authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-draugiem

## Usage

#### Configure Strategy

    passport.use(new DraugiemStrategy({
        appId: DRAUGIEM_APP_ID,
        appKey: DRAUGIEM_APP_KEY,
        callbackURL: "http://localhost:3000/auth/draugiem/callback"
      },
      function(apiKey, profile, done) {
        User.findOrCreate({ draugiem: profile.uid }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'draugiem'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/draugiem',
      passport.authenticate('draugiem'));

    app.get('/auth/draugiem/callback', 
      passport.authenticate('draugiem', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Credits

  - [Ēriks Remess](http://github.com/EriksRemess)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2021 Ēriks Remess
