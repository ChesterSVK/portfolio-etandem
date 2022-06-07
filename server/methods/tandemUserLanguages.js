import { Meteor } from 'meteor/meteor';
import { Rooms }  from 'meteor/rocketchat:models';
import TandemUserLanguages  from '../models/TandemUserLanguages';
import {TeachingMotivationEnum} from "../../lib/helperData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
     * Check whether the user has some language preferences
     * @returns {boolean} true if user has some language preferences, false otherwise
     */
	'tandemUserLanguages/hasSomePreferences'() {
		checkUser(this.userId, 'tandemUserLanguages/hasSomePreferences');
		return TandemUserLanguages.findByUserId(this.userId).fetch().length > 0;
	},

    /**
     * @returns {*} All users's language preferences
     */
    'tandemUserLanguages/getPreferences'() {
        if (!this.userId){
            return ready();
        }
        return TandemUserLanguages.findByUserId(this.userId).fetch();
    },

    /**
     * Sets new user's language preferences
     * @param lanugagePreferences to set
     * @param motivation of the preferences
     * @returns {boolean} if operation was successful
     */
	'tandemUserLanguages/setPreferences'(lanugagePreferences, motivation) {
		checkUser(this.userId, 'tandemUserLanguages/setPreferences');
		checkMotivation(motivation);
		setLanguagePreference(lanugagePreferences, motivation);
		Meteor.call('executeLanguageMatching',
            Meteor.userId(),
            TandemUserLanguages.findUserLanguages(Meteor.userId(), motivation).fetch());
		return true;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

//////////////////////////////////////////////////////////////////////////////////////////////////	Validity functions

function checkUser(userId, method) {
    if (!userId){
        throw new Meteor.Error('error-invalid-user', 'Invalid user', {
            method: method,
        });
    }
}

function checkMotivation(motivation) {
    if (!(motivation === TeachingMotivationEnum.WTLEARN || motivation === TeachingMotivationEnum.WTTEACH)){
        throw new Meteor.Error('error-invalid-motivation', 'Invalid motivation: ' + motivation, {
            method: 'tandemUserLanguages/setPreferences',
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function setLanguagePreference(languagePreferences, motivation) {
    let alreadyInserted = [];
    if (languagePreferences && Array.isArray(languagePreferences)){

        if (languagePreferences.length > 5){
            throw new Meteor.Error('error-too-many-preferences', 'Limit is 5', {
                method: 'tandemUserLanguages/setPreferences',
            });
        }

        TandemUserLanguages.deleteUserPreferences(Meteor.userId(), motivation);

        languagePreferences.forEach(function (preference) {
            if (alreadyInserted.indexOf(preference.langId) === -1){
                TandemUserLanguages.insertNew(Meteor.userId(), motivation, preference);
                alreadyInserted.push(preference.langId);
            }
        })
    }
}