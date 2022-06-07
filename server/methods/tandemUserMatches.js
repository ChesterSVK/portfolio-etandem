import {Meteor} from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import TandemUsersMatches from '../models/TandemUsersMatches';
import TandemLanguages from '../models/TandemLanguages';
import TandemLanguageMatches from '../models/TandemLanguageMatches';
import {Roles, Rooms, Users, Messages} from 'meteor/rocketchat:models';
import { t } from 'meteor/rocketchat:utils';
import {MatchingRequestStateEnum} from "../../lib/helperData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods


Meteor.methods({

    /**
	 * Method for checking if the user has some existing user matches
     * @returns {boolean}
     */
	'tandemUserMatches/hasSomeMatches'() {
		if (!this.userId) {
			return this.ready();
		}
		return TandemUsersMatches.findByUserId(this.userId).fetch().length > 0;
	},


    /**
	 * Get the request attached to match that can be found by roomId
     * @param roomId of the match
     * @returns {*} userMatch
     */
	'tandemUserMatches/getMatchingRequest'(roomId) {
		if (!this.userId) {
			return false;
		}
		if (roomId == null || roomId === undefined) {
			return false;
		}
		check(roomId, String);

		const room = Rooms.findOneById(roomId);
		if (room == null) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'tandemUserMatches/showTeacherRequest',
			});
		}

		const userMatch = TandemUsersMatches.findOneByRoomId(roomId);
		if (userMatch == null) {
			throw new Meteor.Error('error-invalid-match', 'Invalid match', {
				method: 'tandemUserMatches/showTeacherRequest',
			});
		}

		return userMatch;
	},


    /**
	 * Accept user match request
     * @param roomId of the user match
     * @returns {boolean} if operation was successful
     */
	'tandemUserMatches/acceptTeacherRequest'(roomId) {
		if (!this.userId) {
			return false;
		}
		if (!roomId) {
			return false;
		}
		check(roomId, String);

		TandemUsersMatches.acceptMatchRequest(roomId);

		Meteor.call('reloadLanguageMatching', {});
		return true;
	},


    /**
     * Decline user match request
     * @param roomId of the user match
     * @returns {boolean} if operation was successful
     */
	'tandemUserMatches/declineTeacherRequest'(roomId) {
		if (!this.userId) {
			return false;
		}
		if (!roomId) {
			return false;
		}
		check(roomId, String);

		TandemUsersMatches.declineMatchRequest(roomId);
		return true;
	},


    /**
     * Create user match and request based on the roomId and languageMatch
     *
     * @returns {*} Room of the userLanguageMatch
     */

	'tandemUserMatches/createMatchingRequest'(match) {
		const user = Meteor.user();
        checkUser(user._id, 'tandemUserMatches/createMatchingRequest');


        checkUserLanguageMatch(match);

        const matchingLanguage = match.matchingLanguage;
        const symmetricLanguage = getSymetricLanguage(match.languagesInMatch, matchingLanguage);
        const name = '[' + matchingLanguage + '] ' + match.teacher.username
            + ' - '
            + user.username + ' [' + symmetricLanguage + ']';

        const room = createRoom(name, [user.username, match.teacher.username], false, {}, {
            topic: t("tandem_room_topic", {
                lang1: matchingLanguage,
                lang2: symmetricLanguage
            })});

        return createRequest(user, match, room.rid);
	},

    /**
	 * Transforms user matches data format for better front end handling / iteration through data
     * @param userMatches
     * @returns {*} transformed user matches
     */
	'tandemUserMatches/transform' (userMatches) {
        checkUser(this.userId, 'tandemUserMatches/createMatchingRequest');
        checkUserMatches(userMatches);
		return userMatches.map(function (match) {
			return getMatchObject(match);
		});
	},


    /**
	 * Returns all user's user matches that are not MatchingRequestStateEnum.DECLINED
     * @returns {*}
     */
	'tandemUserMatches/getAllMatches'() {
        checkUser(this.userId, 'tandemUserMatches/getAllMatches');

		const query = {
			users: this.userId,
			status: {
				$in: [
					MatchingRequestStateEnum.ACCEPTED,
					MatchingRequestStateEnum.COMPLETED,
					MatchingRequestStateEnum.PENDING
				]
			},
			unmatched: false,
		};

		return TandemUsersMatches.findWithOptions(query).fetch();
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

//////////////////////////////////////////////////////////////////////////////////////////////////	Validity functions

function checkUserLanguageMatch(userLanguageMatch) {
    if (userLanguageMatch === undefined || typeof userLanguageMatch !== 'object') {
        throw new Meteor.Error(
        	'error-invalid-user-language-match', 'Invalid user language match', {method: 'tandemUserMatches/createMatchingRequest'});
    }
    if (!userLanguageMatch.languagesInMatch || userLanguageMatch.languagesInMatch.length !== 2){
        throw new Meteor.Error(
            'error-invalid-user-language-match', 'Invalid user language match languages count', {method: 'tandemUserMatches/createMatchingRequest'});
    }
    if (userLanguageMatch.teacher === undefined){
        throw new Meteor.Error(
            'error-invalid-user-language-match', 'Invalid user language match teacher', {method: 'tandemUserMatches/createMatchingRequest'});
    }
}

function checkUser(userId, method){
    if (!userId) {
        throw new Meteor.Error(
            'error-invalid-user', 'Invalid user', {method: method});
    }
}

function checkRoom(roomId) {
    if (roomId === undefined) {
        throw new Meteor.Error(
            'error-invalid-userLanguageMatch', 'Invalid userLanguageMatch', {method: 'tandemUserMatches/createMatchingRequest'});
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////	Getters

function getSymetricLanguage(matchingLangs, matchingLang) {
    return matchingLangs[0] === matchingLang ? matchingLangs[1] : matchingLangs[0];
}

/**
 * Transforms user match data
 * @param match
 * @returns {{status: *, unmatched: boolean, roomName: *, matchingLanguage: *, symetricLanguage: *, matchingLanguageTeacher: *, symetricLanguageTeacher: *}}
 */
function getMatchObject(match) {
	return {
		status: match.status,
		unmatched: match.unmatched,
		roomName : Rooms.findOneByIdOrName(match.roomId).name,
		matchingLanguage : TandemLanguages.findOneById(match.matchingLanguage.matchingLanguageId).name,
		symetricLanguage : TandemLanguages.findOneById(match.symetricLanguage.symetricLanguageId).name,
		matchingLanguageTeacher : Users.findOneById(match.matchingLanguage.matchingLanguageTeacherId),
		symetricLanguageTeacher : Users.findOneById(match.symetricLanguage.symetricLanguageTeacherId),
	};
}

/**
 * Returns the other language from the languages array of length 2
 * @param languages array
 * @param matchingLang
 * @returns {*}
 */
function getSymetricLang(languages, matchingLang){
    if (languages.length === 2){
        if (languages[0] === matchingLang){
            return languages[1];
        }
        if (languages[1] === matchingLang){
            return languages[0];
        }
    }
    return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createRoom(name, members, readOnly = false, customFields = {}, extraData = {}){
    check(members, Match.Optional([String]));

    if (!Meteor.userId()) {
        throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'createPrivateGroup' });
    }

    if (!RocketChat.authz.hasPermission(Meteor.userId(), 'create-p')) {
        throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'createPrivateGroup' });
    }

    return RocketChat.createRoom('p', name, Meteor.user() && Meteor.user().username, members, readOnly, { customFields, ...extraData });
}

function createRequest(user, userLanguageMatch, roomId){
    checkRoom(roomId);

    createWelcomeMessageInRoom(roomId, userLanguageMatch, user);
    TandemLanguageMatches.hideMatch(userLanguageMatch._id);
    Roles.addUserRoles(user._id, ['tandem-user'], {});
    Roles.addUserRoles(userLanguageMatch.teacher._id, ['tandem-user'], {});

    createUserMatch(user._id, roomId, userLanguageMatch);

    return Rooms.findOneByIdOrName(roomId);
}


function createWelcomeMessageInRoom(roomId, userLanguageMatch, user) {
    Messages.createWithTypeRoomIdMessageAndUser(
        undefined,
        roomId,
        t("get_request_welcome_message",
            {
                lang1: userLanguageMatch.matchingLanguage,
                lang2: getSymetricLang(userLanguageMatch.languagesInMatch, userLanguageMatch.matchingLanguage)
            }),
        user, {});
}

function createUserMatch(userId, roomId, userLanguageMatch) {

    const matchingLangId = TandemLanguages
        .findOneByLangName(userLanguageMatch.matchingLanguage)._id;
    const symetricLangId = TandemLanguages
        .findOneByLangName(getSymetricLang(userLanguageMatch.languagesInMatch, userLanguageMatch.matchingLanguage))._id;

    TandemUsersMatches.createUserMatchByLanguageMatch(
    	userId,
		userLanguageMatch.teacher._id,
		[userId, userLanguageMatch.teacher._id],
		roomId, matchingLangId, symetricLangId
	);
}

function checkUserMatches(userMatches) {
    if (userMatches === undefined || !Array.isArray(userMatches)) {
        throw new Meteor.Error(
            'error-invalid-match', 'Invalid match', {method: 'tandemUserMatches/createMatchingRequest'});
    }
}
