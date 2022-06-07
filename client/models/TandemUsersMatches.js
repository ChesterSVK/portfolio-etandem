import { Base } from 'meteor/rocketchat:models';

export class TandemUsersMatches extends Base {
	constructor() {
		super();
		this._initModel('tandem_users_matches');
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

	findAll(){
		return this.find({});
	}
}

export default new TandemUsersMatches();
