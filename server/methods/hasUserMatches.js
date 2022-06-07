import { Meteor } from 'meteor/meteor';
import { hasPermission } from 'meteor/rocketchat:authorization';
import { Roles } from 'meteor/rocketchat:models';
import TandemUsersMatches from '../models/TandemUsersMatches'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
     * @returns {boolean} true if user has some language preferences set, false otherwise
     */
	hasUserMatches() {
		if (!Meteor.userId()) {
			return false;
		}
		return TandemUsersMatches.findMatches(Meteor.userId(), false).fetch().length > 0;
	},
});
