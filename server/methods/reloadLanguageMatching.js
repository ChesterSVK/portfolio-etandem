import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {hasPermission} from 'meteor/rocketchat:authorization';
import {Roles} from 'meteor/rocketchat:models';
import {getUserPreference} from 'meteor/rocketchat:utils';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
     * Updates user language matches data
     * @param preferences to update
     * @returns {boolean} if successful
     */
    reloadLanguageMatching(preferences) {

        if (!Meteor.userId())
            return false;

        checkPreferences(preferences);

        const changed = checkPreferencesChanged(preferences);

        if (changed)
            handleChangedPreferences(preferences);

        return true;
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

/**
 * Checks if the given preferences have valid values
 * @param preferences to check
 */
function checkPreferences(preferences) {
    const keys = {
        tandemExcludeFromMatching: Match.Optional(Boolean),
        tandemAllowMultipleTeachings: Match.Optional(Boolean),
    };

    check(preferences, Match.ObjectIncluding(keys));
}

/**
 * Checks if the given preferences are different from the saved ones to prevent additional and useless reloading
 * @param preferences
 * @returns {boolean} if preferences changed
 */
function checkPreferencesChanged(preferences) {
    const originalPreferences = {
        excluded: getUserPreference(Meteor.user(), 'tandemExcludeFromMatching'),
        allowMultipleTeachings: getUserPreference(Meteor.user(), 'tandemAllowMultipleTeachings'),
    };

    let changed = false;
    if ((preferences.tandemExcludeFromMatching !== originalPreferences.excluded) ||
        (preferences.tandemAllowMultipleTeachings !== originalPreferences.allowMultipleTeachings)
    ) changed = true;

    return changed;
}

/**
 * Save changed preferences and update language matches
 * @param preferences
 */
function handleChangedPreferences(preferences) {
    Meteor.call('saveUserPreferences', preferences);
    Meteor.call('executeLanguageMatching', Meteor.userId(), []);
}
