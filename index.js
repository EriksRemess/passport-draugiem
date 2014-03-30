var passport = require('passport')
  , util = require('util')
  , request = require('request')
  , md5sum = function(string) {
    return require('crypto').createHash('md5').update(string).digest('hex');
  };

function Strategy(options, verify) {
  if (typeof options.appId !== 'string') throw new Error('You must provide an app id');
  if (typeof options.appKey !== 'string') throw new Error('You must provide a app key');
  if (typeof options.callbackURL !== 'string') throw new Erorr('You must provide a callback URL');
  this.name = 'draugiem';
  this._verify = verify;
  this._appId = options.appId;
  this._appKey = options.appKey;
  this._callbackURL = options.callbackURL;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req) {
  if (req.query['dr_auth_status'] &&  req.query['dr_auth_status'] === 'ok' && req.query['dr_auth_code'] && (/^[a-z0-9]{20}$/).test(req.query['dr_auth_code'])) {
    return this.authorize(req);
  } else {
    return this.redirectToAuthorize(req);
  }
}

Strategy.prototype.redirectToAuthorize = function(req) {
  this.redirect('http://api.draugiem.lv/authorize/?app=' + this._appId + '&hash=' + md5sum(this._appKey + this._callbackURL) + '&redirect=' + this._callbackURL);
}

Strategy.prototype.authorize = function(req) {
  var self = this;
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  request('http://api.draugiem.lv/json/?action=authorize&app=' + this._appKey + '&code=' + req.query['dr_auth_code'], function(error, response, body){
    if(error) return self.error(error);
    try {
      var data = JSON.parse(body);
      if(data.apikey){
        var profile = data.users[data.uid];
        if (self._passReqToCallback) {
          self._verify(req, data.apikey, profile, verified);
        } else {
          self._verify(data.apikey, profile, verified);
        }
      } else {
        return self.error('no key in response');
      }
    } catch(error) {
      return self.error(error);
    }
  });
}

exports.version = '0.0.3';
exports = module.exports = Strategy;
exports.Strategy = Strategy;
