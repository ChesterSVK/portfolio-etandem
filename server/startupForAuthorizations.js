/* eslint no-multi-spaces: 0 */
import {Meteor} from 'meteor/meteor';
import {Roles, Permissions} from 'meteor/rocketchat:models';

/*
	Add custom tandem roles and permissions to existing ones during startup
*/
Meteor.startup(function () {
	// Note:
	// 1. if we need to create a role that can only edit channel message, but not edit group message
	// 2. admin, moderator, and user roles should not be deleted as they are referred in the code.
	const permissions = [
		// Tandem addition
		{_id: 'tandem-view-directory', roles: ['admin']},
		{_id: 'tandem-search', roles: ['admin']},
		{_id: 'tandem-report-user', roles: ['admin', 'tandem-user']},
		{_id: 'tandem-unmatch', roles: ['admin', 'tandem-user']},
		{_id: 'tandem-ui-sort', roles: ['admin']},
        {_id: 'tandem-hide', roles: ['admin']},
		{_id: 'tandem-ui-view-mode', roles: ['admin']},
        {_id: 'tandem-developer', roles: ['admin']},
	];

	for (const permission of permissions) {
		if (!Permissions.findOneById(permission._id)) {
			Permissions.upsert(permission._id, {$set: permission});
		}
	}

	const tandemRoles = [
		{name: 'tandem-user', scope: 'Users', description: 'Tandem user'},
	];

	for (const role of tandemRoles) {
		Roles.upsert(
			{
				_id: role.name
			}, {
				$setOnInsert: {
					scope: role.scope,
					description: role.description || '',
					protected: true,
					mandatory2fa: false
				}
			});
	}
});
