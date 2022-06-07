import { Base } from 'meteor/rocketchat:models';

export class TandemLanguageMatches extends Base {
	constructor() {
		super();
		this._initModel('tandem_language_matches');
	}
}

export default new TandemLanguageMatches();
