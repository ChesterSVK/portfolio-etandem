import { Base } from 'meteor/rocketchat:models';

export class TandemLanguages extends Base {
	constructor() {
		super();
		this._initModel('tandem_languages');
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

	findById(langId) {
		return this.findOne({_id: langId});
	}

	findAll() {
		return this.find({});
	}
}

export default new TandemLanguages();
