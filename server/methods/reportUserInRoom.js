import {Meteor} from 'meteor/meteor';
import {Match, check} from 'meteor/check';
import {Rooms, Subscriptions, Users, Messages} from 'meteor/rocketchat:models';
import {hasPermission} from 'meteor/rocketchat:authorization';
import TandemUsersMatches from '../models/TandemUsersMatches';
import {TandemFeedbackMails} from "../../lib/feedbackMails";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({

    /**
     * Method for reporting user parsed from the data parameter
     * @param data to create the report from
     * @returns {boolean} if successful
     */
    reportUserInRoom(data) {
        checkInput(data);
        checkReason(data);
        const fromId = checkUser(Meteor.userId());
        checkUsersPermissions(fromId, data);
        checkRoom(data);
        checkSubscription(data);
        const reportedUser = getReportedUser(data, fromId);
        const match = checkMatch(data, fromId);
        reportUsersInMatch(data, fromId, reportedUser._id, match);
        sendEmailReport(data, fromId, reportedUser._id);
        return true;
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

///////////////////////////////////////////////////////////////////////////////////////////////////	Validity functions

/**
 * Straightforward
 **/
function checkInput(data) {
    check(data, Match.ObjectIncluding({
        rid: String,
        username: String,
    }));
}

/**
 * Straightforward
 **/
function checkReason(data) {
    if (!data.reason) {
        throw new Meteor.Error('error-invalid-reason', 'Reason not provided', {
            method: 'reportUserInRoom',
        });
    }
}

/**
 * Straightforward
 **/
function checkUser(id) {
    if (!id) {
        throw new Meteor.Error('error-invalid-user', 'Invalid user', {
            method: 'reportUserInRoom',
        });
    }
    return id;
}

/**
 * Straightforward
 **/
function checkUsersPermissions(id, data) {
    if (!hasPermission(id, 'tandem-report-user', data.rid)) {
        throw new Meteor.Error('error-not-allowed', 'Not allowed', {
            method: 'reportUserInRoom',
        });
    }
}

/**
 * Straightforward
 **/
function checkRoom(data) {
    const room = Rooms.findOneById(data.rid);
    if (!room) {
        throw new Meteor.Error('error-invalid-room', 'Invalid room', {
            method: 'reportUserInRoom',
        });
    }

    if (['c', 'p', 'd'].includes(room.t) === false) {
        throw new Meteor.Error('error-invalid-room-type', `${ room.t } is not a valid room type`, {
            method: 'reportUserInRoom',
            type: room.t,
        });
    }
}

/**
 * Straightforward
 **/
function checkSubscription(data) {
    const subscription = Subscriptions.findOneByRoomIdAndUsername(data.rid, data.username, {fields: {_id: 1}});
    if (!subscription) {
        throw new Meteor.Error('error-user-not-in-room', 'User is not in this room', {
            method: 'reportUserInRoom',
        });
    }
}

/**
 * Straightforward
 **/
function getReportedUser(data, reporterId) {
    const reportedUser = Users.findOneByUsername(data.username);
    if (reportedUser._id === reporterId) {
        throw new Meteor.Error('error-invalid-report', 'Invalid reporting yourself', {
            method: 'reportUserInRoom',
        });
    }
    return reportedUser;
}

/**
 * Straightforward
 **/
function checkMatch(data, fromUserId) {
    const match = TandemUsersMatches.findByUserIdAndRoomId(fromUserId, data.rid);

    if (!match) {
        throw new Meteor.Error('error-invalid-match', 'Invalid match', {
            method: 'reportUserInRoom',
        });
    }
    return match;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Straightforward
**/
function reportUsersInMatch(data, fromUserId, toUserId, match){
    if (!match.reportedUsers) {
        TandemUsersMatches.reportUserInMatch(fromUserId, match._id, toUserId, data.reason);
    }

    else if (Array.isArray(match.reportedUsers)) {
        match.reportedUsers.forEach(function (report) {
            if (report.from === fromUserId && report.to === toUserId) {
                throw new Meteor.Error('error-already-reported', 'Already Reported', {
                    method: 'reportUserInRoom',
                });
            }
        });
        TandemUsersMatches.reportUserInMatch(fromUserId, match._id, toUserId, data.reason);
    }
}

/**
 * Straightforward
 **/
function sendEmailReport(data, fromUserId, toUserId) {
    const reportEmailData = {
        userTo: toUserId,
        userFrom: fromUserId,
        reason: data.reason
    };

    Meteor.call('tandemSendEmail',
        TandemFeedbackMails.types.REPORT,
        reportEmailData,
        (error, result) => {
            if (error) {
                throw new Meteor.Error('error-sending-email', 'Internal error', {
                    method: 'reportUserInRoom',
                });
            }
        });
}