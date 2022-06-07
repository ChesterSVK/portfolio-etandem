import {Base} from 'meteor/rocketchat:models';

/*
	Model for language
*/


export class TandemLanguages extends Base {
    constructor() {
        super('tandem_languages');

        this.model.before.insert((userId, doc) => {
        });

        this.tryEnsureIndex({
            langCode: 1,
        }, {
            unique: 1,
            sparse: 1
        });

        this.tryEnsureIndex({
            langName: 1,
        }, {
            unique: 1,
            sparse: 1
        });

        this.tryEnsureIndex({
            langCode: 1,
            langName: 1,
        }, {
            unique: 1,
            sparse: 1
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

    /**
     * Straightforward
     **/
    findOneByLangName(langName) {
        return this.findOne(
            {
                name: langName
            });
    }

    /**
     * Straightforward
     **/
    findOneById(langId) {
        return this.findOne(
            {
                _id: langId
            });
    }

    /**
     * Straightforward
     **/
    findAll() {
        return this._db.find({});
    }
}

export default new TandemLanguages();
