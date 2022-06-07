import {Meteor} from 'meteor/meteor';
import {hasPermission} from 'meteor/rocketchat:authorization';
import {Roles, Users} from 'meteor/rocketchat:models';
import {getUserPreference} from 'meteor/rocketchat:utils';
import TandemUserLanguages from '../models/TandemUserLanguages'
import TandemUsersMatches from '../models/TandemUsersMatches'
import TandemLanguageMatches from '../models/TandemLanguageMatches'
import {TeachingMotivationEnum, LanguageLevelsEnum, MatchingRequestStateEnum} from "../../lib/helperData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
	 * Executes language matching algorithm
     * @param userId what user requested the matching
     * @param newLangPreferences user's preferences
     * @returns {boolean} if execution was successful
     */
    executeLanguageMatching(userId, newLangPreferences) {
        if (!userId) return false;

        if (!Array.isArray(newLangPreferences)) return false;

        if (!newLangPreferences.length) newLangPreferences = TandemUserLanguages.findByUserId(userId).fetch();

        if (!newLangPreferences.length) return false;

        return execute(userId, newLangPreferences);
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

function execute(userId, newLangPreferences) {
    const user = Users.findOneById(userId);

    TandemLanguageMatches.removeMatchesWhereUser(userId);

    const filteredPreferences = filterPreferencesFromExistingMatches(newLangPreferences);
    filteredPreferences.forEach(function (filteredPreference) {

        const allMatchingLanguagePreferencesExceptUser = findLanguagePreferenceMatch(userId, filteredPreference);
        createSymmetricMatches(user, allMatchingLanguagePreferencesExceptUser, filteredPreference.motivation);
    });

    return true;
}

function filterPreferencesFromExistingMatches(preferences) {
    return preferences.filter(preference => {
        return getExistingMatchesNotEqualToUser(preference.userId, preference.langId).count() === 0;
    });
}

/**
 * Get all language matches with opposite motivation than user's
 * @param userId
 * @param preference users preference
 * @returns {*|Promise<Response>}
 */
function findLanguagePreferenceMatch(userId, preference) {
    return TandemUserLanguages.findLanguageMatches(
        userId,
        negateMotivation(preference.motivation),
        preference.langId,
        getLanguageLevels(preference.levelId, preference.motivation)
    ).fetch();
}

/**
 * Negates the motivation for languages
 * @param motivation to negate
 * @returns {string} opposite motivation
 */
function negateMotivation(motivation) {
	if (motivation === TeachingMotivationEnum.WTLEARN) {
		return TeachingMotivationEnum.WTTEACH;
	}
	if (motivation === TeachingMotivationEnum.WTTEACH) {
		return TeachingMotivationEnum.WTLEARN;
	}
}

/**
 * Get all language levels that are less/greater or equal than some level, depending on the motivation
 * E.g motivation = WTTEACH, level = B2 , result = [A1,A2,B1,B2] so some user can teach on B2 and the user can have only student matches with less or equal motivation of learning
 * E.g motivation = WTLEARN, level = B2 , result = [B2,C1,C2] so some user wants to learn B2 and the user can have only teacher matches with higher or equal experience of teaching
 * @param levelId to compare with
 * @param motivation to set the comparison condition
 * @returns {Array} of language levels
 */
function getLanguageLevels(levelId, motivation) {
	let comparator = false;
	if (motivation === TeachingMotivationEnum.WTLEARN) {
		comparator = false;
	}
	if (motivation === TeachingMotivationEnum.WTTEACH) {
		comparator = true;
	}

	let resLevels = [];
	for (let property in LanguageLevelsEnum) {
		if (LanguageLevelsEnum.hasOwnProperty(property)) {
			if (comparator) {
				resLevels.push(LanguageLevelsEnum[property])
			}
			if (LanguageLevelsEnum[property] === levelId) {
				comparator = !comparator;
				//To allow equal level as well
				if (comparator) {
					resLevels.push(LanguageLevelsEnum[property])
				}
			}
		}
	}
	return resLevels;
}

/**
 * Custom helper object to help with comparison and conditions of finding the right user language match
 * Contains language that user can teach and language level teaching experience value
 * @param languagesToTeach
 */
function createLanguagesLevelObject(languagesToTeach) {
	// Object format:
	// { langId : langLevel, ... }
	const result = {};
	languagesToTeach.forEach(function (languageToTeach) {
		result[languageToTeach.langId] = languageToTeach.levelId;
	});
	return result;
}

/**
 * Gets user languages with opposite motivation
 * @param user
 * @param motivation
 * @returns {*|Promise<Response>}
 */
function getUsersLanguagesWithOppositeMotivation(user, motivation){
    return TandemUserLanguages.findUserLanguages(
        user._id,
        negateMotivation(motivation)
    ).fetch();
}

function createSymmetricMatches(user, otherUsersLanguagePreferences, newLangPreferenceMotivation) {

	if (!otherUsersLanguagePreferences.length) return;

	const usersLanguagesWithOppositeMotivation = getUsersLanguagesWithOppositeMotivation(user, newLangPreferenceMotivation);
	if (!usersLanguagesWithOppositeMotivation.length) return;

	let languageLevelsObject = createLanguagesLevelObject(usersLanguagesWithOppositeMotivation);

	otherUsersLanguagePreferences.forEach(function (languagePreferenceOfOtherUser) {

        const otherUsersLanguagePreferencesWithOppositeMotivation = TandemUserLanguages.findUserLanguages(
            languagePreferenceOfOtherUser.userId,
            newLangPreferenceMotivation
        ).fetch();

		otherUsersLanguagePreferencesWithOppositeMotivation.forEach(function (userLanguagePreference) {
			if (otherUserIsNotAlreadyInSomeMatch(userLanguagePreference)){
				createSuitableMatches(userLanguagePreference, languageLevelsObject, newLangPreferenceMotivation, languagePreferenceOfOtherUser, user);
			}
			else {
				if (getUserPreference(userLanguagePreference.userId, 'tandemAllowMultipleTeachings', false)){
					createSuitableMatches(userLanguagePreference, languageLevelsObject, newLangPreferenceMotivation, languagePreferenceOfOtherUser, user);
				}
			}
		});
	});
}

/**
 * @param userLanguagePreference user's language preference
 * @returns {boolean} true if user is already in some existing user match with same language preferences,
 * 		false otherwise
 */
function otherUserIsNotAlreadyInSomeMatch(userLanguagePreference) {
	return TandemUsersMatches.findWithOptions({
		$or: [
			{
				"matchingLanguage.matchingLanguageId": userLanguagePreference.langId,
				"matchingLanguage.matchingLanguageTeacherId": {$ne: userLanguagePreference.userId},
				"symetricLanguage.symetricLanguageTeacherId": userLanguagePreference.userId
			},
			{
				"symetricLanguage.symetricLanguageId": userLanguagePreference.langId,
				"symetricLanguage.symetricLanguageTeacherId": {$ne: userLanguagePreference.userId},
				"matchingLanguage.matchingLanguageTeacherId": userLanguagePreference.userId,
			},
		],
	}).count() === 0;
}

/**
 * Create suitable user matches according to provided parameters
 * @param userLanguagePreference language preference of the user
 * @param languageLevelsObject custom made object to match language level in possible user match
 * @param newLangPreferenceMotivation motivation of the new language preference
 * @param languagePreferenceOfOtherUser preferences of ther users based on som criteria
 * @param user
 */
function createSuitableMatches(userLanguagePreference, languageLevelsObject, newLangPreferenceMotivation, languagePreferenceOfOtherUser, user) {
	//Symmetric match not found in the lang levels object
	if (languageLevelsObject[userLanguagePreference.langId] === undefined) return;
	// Match for learning
	if (newLangPreferenceMotivation === TeachingMotivationEnum.WTLEARN) {
		if (getLanguageLevels(
			languageLevelsObject[userLanguagePreference.langId],
			negateMotivation(newLangPreferenceMotivation)
		).includes(userLanguagePreference.levelId)) {

			TandemLanguageMatches.createUserMatch(user._id, languagePreferenceOfOtherUser, userLanguagePreference.langId);
		}
	}
	// Match for teaching
	if (newLangPreferenceMotivation === TeachingMotivationEnum.WTTEACH) {
		if (getLanguageLevels(
			languageLevelsObject[userLanguagePreference.langId],
			negateMotivation(newLangPreferenceMotivation)
		).includes(userLanguagePreference.levelId)) {

			TandemLanguageMatches.createUserMatch(user._id, languagePreferenceOfOtherUser, userLanguagePreference.langId);
		}
	}
}

/**
 * Returns all user matches that are not userId's with specified language
 * @param userId to filter
 * @param languageId to match the language
 * @returns {*}
 */
function getExistingMatchesNotEqualToUser(userId, languageId) {
	return TandemUsersMatches.findWithOptions(
		{
			$or: [
				{
					"matchingLanguage.matchingLanguageId": languageId,
					"matchingLanguage.matchingLanguageTeacherId": {$ne: userId}
				},
				{
					"symetricLanguage.symetricLanguageId": languageId,
					"symetricLanguage.symetricLanguageTeacherId": {$ne: userId}
				},
			],
			status: {$in: [MatchingRequestStateEnum.ACCEPTED, MatchingRequestStateEnum.PENDING]},
			unmatched: false
		});
}