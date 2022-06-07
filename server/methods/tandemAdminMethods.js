import {Meteor} from 'meteor/meteor';
import {Roles} from 'meteor/rocketchat:models';
import TandemUsersMatches from '../models/TandemUsersMatches'
import TandemLanguageMatches from '../models/TandemLanguageMatches'
import TandemUserLanguages from '../models/TandemUserLanguages'
import TandemLanguages from '../models/TandemLanguages'
import { RocketChat } from 'meteor/rocketchat:lib';
import { hasPermission } from 'meteor/rocketchat:authorization';
import {MatchingRequestStateEnum, TeachingMotivationEnum} from "../../lib/helperData";



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({
    'deleteAllLanguagePreferences'(){
        if(!this.userId)
            return false;
        if (!hasPermission(this.userId, 'tandem-developer'))
            return false;
        TandemUserLanguages.removeAll();
        return TandemUserLanguages.findAll().count() === 0;
    },
    'deleteAllLanguageMatches'(){
        if (!this.userId)
            return false;
        if (!hasPermission(this.userId, 'tandem-developer'))
            return false;
        TandemLanguageMatches.removeAll();
        return TandemLanguageMatches.findAll().count() === 0;
    },
    'deleteAllUserMatches'(){
        if (!this.userId)
            return false;
        if (!hasPermission(this.userId, 'tandem-developer'))
            return false;
        deleteAllUserMatches();
        return TandemUsersMatches.findAll().count() === 0;
    },
    'languagePreferenceStatistics'(){
        if (!this.userId)
            return [];
        return getLanguagePreferenceStatistics();
    },
    'generalStatistics'(){
        if (!this.userId)
            return [];
        return getGeneralStatistics();
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

//////////////////////////////////////////////////////////////////////////////////////////////////////////////   Getters

function getGeneralStatistics(){
    return {
        'users' : getUsersStatistic(),
        'language_preferences' : getLanguagePreferenceStringStatistic(),
        'user_matches_a' : getUserMatchesStatistic({status: MatchingRequestStateEnum.ACCEPTED, unmatched : false}),
        'user_matches_c' : getUserMatchesStatistic({status: MatchingRequestStateEnum.PENDING, unmatched : false}),
        'user_matches_d' : getUserMatchesStatistic({status: MatchingRequestStateEnum.DECLINED, unmatched : false}),
        'user_matches_p' : getUserMatchesStatistic({status: MatchingRequestStateEnum.PENDING, unmatched : false}),
        'user_matches_all' : getUserMatchesStatistic({}),
        'user_matches_unmatched' : getUserMatchesStatistic({unmatched : true}),
    };
}

function getUsersStatistic() {
    return RocketChat.models.Users.find({}).count()
}

function getLanguagePreferenceStringStatistic() {
    const langs = TandemUserLanguages.findAll().fetch();
    const res = {
        all: 0,
        teaching: 0,
        learning: 0,
    };
    langs.forEach(function (lang) {
        res.all++;
        if (lang.motivation === TeachingMotivationEnum.WTTEACH){
            res.teaching++;
        }
        if (lang.motivation === TeachingMotivationEnum.WTLEARN){
            res.learning++;
        }
    });
    return res.teaching + ' / ' + res.learning + ' / ' + res.all;
}

function getUserMatchesStatistic(query) {
    return TandemUsersMatches.findWithOptions(query).count()
}

function getLanguagePreferenceStatistics() {
    const langPreferences = TandemUserLanguages.findAll().fetch();
    const languages = TandemLanguages.findAll().fetch();
    let result = {};
    languages.forEach(function (language) {
        result[language._id] = {
            langName: language.name,
            langInTeach: 0,
            langInLearn: 0,
        }
    });
    populateLanguageData(result, langPreferences);
    return Object.values(result).sort(sortFunction);
}

function populateLanguageData(languages, preferences){
    preferences.forEach(function (preference) {
        if (preference.motivation === TeachingMotivationEnum.WTLEARN){
            languages[preference.langId].langInLearn++;
        }
        if (preference.motivation === TeachingMotivationEnum.WTTEACH){
            languages[preference.langId].langInTeach++;
        }
    });
}

function sortFunction(a, b){
    const sumA = a.langInLearn + a.langInTeach;
    const sumB = b.langInLearn + b.langInTeach;
    if (sumA > sumB) return -1;
    if (sumA < sumB) return 1;
    if (sumA === sumB){
        return ('' + a.langName).localeCompare(b.langName);
    }
}

function deleteAllUserMatches(){
    const matches = TandemUsersMatches.findAll().fetch();
    matches.forEach(function (match) {
        eraseRoom(match.roomId);
    });
    TandemUsersMatches.removeAll();
}

function eraseRoom(rid) {


    const room = RocketChat.models.Rooms.findOneById(rid);

    if (!room) {
        return;
    }

    if (Apps && Apps.isLoaded()) {
        const prevent = Promise.await(Apps.getBridges().getListenerBridge().roomEvent('IPreRoomDeletePrevent', room));
        if (prevent) {
            console.error('error-app-prevented-deleting', 'A Rocket.Chat App prevented the room erasing.');
            return;
        }
    }

    if (!RocketChat.roomTypes.roomTypes[room.t].canBeDeleted(hasPermission, room)) {
        return;
    }

    RocketChat.models.Messages.removeFilesByRoomId(rid);
    RocketChat.models.Messages.removeByRoomId(rid);
    RocketChat.models.Subscriptions.removeByRoomId(rid);
    const result = RocketChat.models.Rooms.removeById(rid);

    if (Apps && Apps.isLoaded()) {
        Apps.getBridges().getListenerBridge().roomEvent('IPostRoomDeleted', room);
    }

    return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////	Validity functions