import {Base} from 'meteor/rocketchat:models';

/*
	Model for language matches between users' language preferences used in the matching algorithm
*/

export class TandemLanguageMatches extends Base {
    constructor() {
        super('tandem_language_matches');

        this.model.before.insert((userId, doc) => {
            doc.hidden = false;
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Insert

    /**
     * Creates a new user match
     **/
    createUserMatch(userId, match, symmetricLanguageId) {
        return this.insert(
            {
                usersInMatch: [userId, match.userId],
                languagesInMatch: [match.langId, symmetricLanguageId]
            });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Custom

    /**
     * Method changes the match hidden attribute to true.
     **/
    hideMatch(matchId) {
        return this.update(
            {
                _id: matchId
            },
            {
                $set: {hidden: true}
            });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

    /**
     * Straightforward
     **/
    findMatches(query) {
        return this.find(query);
    }

    /**
     * Straightforward
     **/
    findAll() {
        return this.find({});
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Delete

    /**
     * Straightforward
     **/
    removeMatchesWhereUser(userId) {
        return this.remove(
            {
                usersInMatch: userId
            });
    }

    /**
     * Straightforward
     **/
    removeAll() {
        return this.remove({});
    }
}

export default new TandemLanguageMatches();
