import { Base } from 'meteor/rocketchat:models';

export class TandemUserLanguages extends Base {
	constructor() {
		super();
		this._initModel('tandem_user_languages');
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

	findLanguagesWithMotivation(motivation) {
		return this.find({motivation: motivation});
	}

	findAll() {
		return this.find({});
	}
}

export default new TandemUserLanguages();
