import {Base} from 'meteor/rocketchat:models';

/*
	Model for language preferences of a user
*/

export class TandemUserLanguages extends Base {
    constructor() {
        super("tandem_user_languages");

        this.model.before.insert((userId, doc) => {
        });

        this.tryEnsureIndex({
            userId: 1,
            langId: 1,
            motivation: 1,
        }, {
            unique: 1,
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Insert

    /**
     * Insert new user language preference with given motivation.
     **/
    insertNew(userId, motivation, preference) {
        return this.insert(
            {
                userId: userId,
                motivation: motivation,
                levelId: preference.levelId,
                langId: preference.langId,
                credits: preference.credits
            })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

    /**
     * Find user languages with given motivation
     **/
    findByUserId(userId) {
        return this.find(
            {
                userId: userId
            });
    }

    /**
     * Find user languages with given motivation
     **/
    findUserLanguages(userId, motivation) {
        return this.find(
            {
                userId: userId,
                motivation: motivation
            });
    }

    /**
     * Find user language matches with given parameters, list all users except provided one
     **/
    findLanguageMatches(exceptUserId, motivation, langId, levelIds) {
        return this.find(
            {
                userId: {$ne: exceptUserId},
                motivation: motivation,
                langId: langId,
                levelId: {$in: levelIds}
            });
    }

    /**
     * Straightforward
     **/
    findAll() {
        return this.find({});
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Delete

    /**
     * Delete user preference with given motivation
     **/
    deleteUserPreferences(userId, motivation) {
        return this.remove(
            {
                userId: userId,
                motivation: motivation
            });
    }

    /**
     * Straightforward
     **/
    removeAll() {
        return this.remove({});
    }
}

export default new TandemUserLanguages();
