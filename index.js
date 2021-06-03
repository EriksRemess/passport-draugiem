import { Strategy as PassportStrategy } from 'passport';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
export default class Strategy extends PassportStrategy {
  constructor (options, verify) {
    super();
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
  async authenticate (req) {
    const verified = (error, user, info) => {
      if (error) return this.error(error);
      if (!user) return this.fail(info);
      return this.success(user, info);
    }
    if (req.query?.dr_auth_status === 'ok' && (/^[a-z0-9]{20}$/).test(req.query?.dr_auth_code)) {
      try {
        const data = await (await fetch(`http://api.draugiem.lv/json/?action=authorize&app=${this._appKey}&code=${req.query['dr_auth_code']}`)).json();
        if (!data.apikey) return this.error('no key in response');
        let profile = data.users[data.uid];
        if (this._passReqToCallback) return this._verify(req, data.apikey, profile, verified);
        return this._verify(data.apikey, profile, verified);
      } catch (error) {
        return this.error(error);
      }      
    }
    const hash = createHash('md5').update(this._appKey + this._callbackURL).digest('hex');
    return this.redirect(`http://api.draugiem.lv/authorize/?app=${this._appId}&hash=${hash}&redirect=${this._callbackURL}`, 302);
  }
}

export { Strategy };
