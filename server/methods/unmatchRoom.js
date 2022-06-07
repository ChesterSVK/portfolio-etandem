import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {hasPermission} from 'meteor/rocketchat:authorization';
import {Roles} from 'meteor/rocketchat:models';
import TandemUsersMatches from '../models/TandemUsersMatches'
import TandemLanguageMatches from '../models/TandemLanguageMatches'
import {TandemFeedbackMails} from "../../lib/feedbackMails";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({
    unmatchRoom(rid, reason) {
        checkInput(rid, reason);
        checkUser(Meteor.userId());
        const match = getMatch(rid, Meteor.userId());

        //TandemLanguageMatches.hideMatch(match.languageMatch);
        TandemUsersMatches.unmatchMatch(match._id, true);

        sendEmailReport(Meteor.userId(), match, reason);
        Meteor.call('executeLanguageMatching', Meteor.userId(), []);
        return true;
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions

///////////////////////////////////////////////////////////////////////////////////////////////////	Validity functions

/**
 * Straightforward
 */
function checkInput(rid, reason) {
    check(rid, String);
    check(reason, String);
}

/**
 * Straightforward
 */
function checkUser(id) {
    if (!id) {
        throw new Meteor.Error('error-invalid-user', 'Invalid user', {
            method: 'unmatchRoom',
        });
    }
    if (!hasPermission(id, 'tandem-unmatch')) {
        throw new Meteor.Error('error-not-allowed', 'Not allowed', {
            method: 'unmatchRoom',
        });
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////	Getters

/**
 * Get match by roomId and userId
 * @param roomId
 * @param userId
 */
function getMatch(roomId, userId) {
    const match = TandemUsersMatches.findByUserIdAndRoomId(userId, roomId);
    if (!match) {
        throw new Meteor.Error('error-invalid-match', 'Invalid user match', {
            method: 'unmatchRoom',
        });
    }
    return match;
}

/**
 * Get other user id from the array of two users
 * @param usersIds array of length 2
 * @param actualUserId to compare with
 * @returns {*} other user id
 */
function getOtherUser(usersIds, actualUserId) {
    if (usersIds.length !== 2) {
        return false;
    }
    if (usersIds[0] === actualUserId) {
        return usersIds[1];
    }
    else {
        return usersIds[0];
    }
}

/**
 * Sends email report with reason of unmatching the user match
 * @param actualUserId that sends the report
 * @param match that is gonna be reported
 * @param reason for unmatching
 */
function sendEmailReport(actualUserId, match, reason) {
    const reportEmailData = {
        userTo: getOtherUser(match.users, actualUserId),
        userFrom: actualUserId,
        reason: reason
    };

    Meteor.call('tandemSendEmail',
        TandemFeedbackMails.types.UNMATCH,
        reportEmailData,
        (error, result) => {
            if (error) {
                throw new Meteor.Error('error-sending-email', 'Internal error', {
                    method: 'unmatchRoom',
                });
            }
        });
}