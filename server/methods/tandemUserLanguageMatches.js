import {Meteor} from 'meteor/meteor';
import TandemUserLanguages from '../models/TandemUserLanguages';
import TandemLanguageMatches from '../models/TandemLanguageMatches';
import TandemLanguages from '../models/TandemLanguages';
import TandemUsersMatches from '../models/TandemUsersMatches';
import {TeachingMotivationEnum, MatchingRequestStateEnum} from "../../lib/helperData";
import {Users} from 'meteor/rocketchat:models';
import {getUserPreference} from 'meteor/rocketchat:utils';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
     * @returns {*} user language matches according to user's learning preferences
     */
    'tandemUserLanguageMatches/get'() {

        const actualUserId = this.userId;
        if (!actualUserId) {
            return this.ready();
        }

        const languagesToLearnPreferences = getUserLearningPreferences(actualUserId);

        if (languagesToLearnPreferences.length === 0) {
            return [];
        }

        Meteor.call('executeLanguageMatching', actualUserId, languagesToLearnPreferences);
        return formatMatchingResultData(actualUserId, getMatchingResults(actualUserId, languagesToLearnPreferences));
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

function createMatchmakingData(matchingResult, actualUserId) {
    //Get excluded users ids
    const excludedUsersIds = Users.find({
        'settings.preferences.tandemExcludeFromMatching': true,
    }, {
        fields: {
            _id: 1,
        }
    }).fetch().map(idObject => idObject._id);


    const query = {
        usersInMatch: actualUserId,
        languagesInMatch: matchingResult.languageId,
    };

    const langMatches = TandemLanguageMatches.findMatches(query).fetch();

    const filteredExcludedMatches = langMatches.filter(function (match) {
        if (match.usersInMatch.length !== 2) {
            return false;
        }
        const otherUser = getOtherUserId(match.usersInMatch, actualUserId);
        if (excludedUsersIds.includes(otherUser)) {
            return false;
        }
        if (match.hidden) {
            return false;
        }
        return true;
    });

    addFittingLanguageMatches(actualUserId, filteredExcludedMatches, matchingResult);
}

/**
 * Returns other userId in the array of the userIds
 * @param userIds
 * @param actualUserId
 * @returns {*}
 */
function getOtherUserId(userIds, actualUserId) {
    if (userIds[0] === actualUserId) {
        return userIds[1];
    }
    else {
        return userIds[0];
    }
}

/**
 * Formats matches data with initialised attributes
 * so client does not have to get these data by creating too many requests to the server
 * @param actualUserId
 * @param languageMatches
 * @param matchingResult
 */
function addFittingLanguageMatches(actualUserId, languageMatches, matchingResult) {

    matchingResult.matches = languageMatches.map(function (item) {
        return {
            _id: item._id,
            teacher: Users.findOneById(getOtherUserId(item.usersInMatch, actualUserId)),
            matchingLanguage: matchingResult.languageName,
            languagesInMatch: item.languagesInMatch.map(function (lang) {
                return TandemLanguages.findOneById(lang).name;
            })
        };
    });
}

/**
 * Returns user language preferences that user wants to learn
 * @param userId
 * @returns {*}
 */
function getUserLearningPreferences(userId) {
    const res = TandemUserLanguages.findUserLanguages(userId, TeachingMotivationEnum.WTLEARN).fetch();
    if (!Array.isArray(res)) {
        return [];
    }
    return res;
}

/**
 * Creates matching teaching results according to languagePreferences that user wants to learn
 * If no matches are found creates a bit different format of the data
 * @param userId
 * @param languagesToLearnPreferences
 * @returns {Array}
 */
function getMatchingResults(userId, languagesToLearnPreferences) {
    let matchingResults = [];
    languagesToLearnPreferences.forEach(function (languageToLearn) {

        const languageName = TandemLanguages.findOneById(languageToLearn.langId).name;
        const existingMatches = TandemUsersMatches.findWithOptions({
            $or: [
                {
                    "matchingLanguage.matchingLanguageId": languageToLearn.langId,
                    "matchingLanguage.matchingLanguageTeacherId": {$ne: userId},
                    "symetricLanguage.symetricLanguageTeacherId": userId
                },
                {
                    "symetricLanguage.symetricLanguageId": languageToLearn.langId,
                    "symetricLanguage.symetricLanguageTeacherId": {$ne: userId},
                    "matchingLanguage.matchingLanguageTeacherId": userId,
                },
            ],
            status: {$in: [MatchingRequestStateEnum.ACCEPTED, MatchingRequestStateEnum.PENDING]},
            unmatched: false
        }).fetch();

        if (existingMatches.length) {
            matchingResults.push({
                languageName: languageName,
                languageId: languageToLearn.langId,
                alreadyExists: true,
                existingRoom: existingMatches[0].roomId,
                skip: true,
            });
        }
        else {
            matchingResults.push({
                languageName: languageName,
                languageId: languageToLearn.langId,
                matches: [],
                alreadyExists: false,
                existingRoom: false,
                skip: false,
            });
        }
    });
    return matchingResults;
}

/**
 * Formats the result data according to front end requirements
 * @param userId
 * @param matchingResults
 * @returns {*}
 */
function formatMatchingResultData(userId, matchingResults) {
    matchingResults.forEach(function (matchingResult) {
        if (!matchingResult.skip) {
            createMatchmakingData(matchingResult, userId);
        }
    });
    return matchingResults;
}