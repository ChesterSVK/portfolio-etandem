import {Meteor} from 'meteor/meteor';
import {Roles, Rooms, Users, Messages} from 'meteor/rocketchat:models';
import {check} from 'meteor/check';
import {t} from 'meteor/rocketchat:utils';
import * as Mailer from 'meteor/rocketchat:mailer';
import {TandemFeedbackMails} from "../../lib/feedbackMails";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Methods

Meteor.methods({
    /**
     * Sends an email
     * @param type of the email
     * @param data to create the email message
     * @returns {boolean|*}
     */
    'tandemSendEmail'(type, data) {
        switch (type) {
            case TandemFeedbackMails.types.REPORT:
                return sendReport(data);
            case TandemFeedbackMails.types.UNMATCH:
                return sendUnmatchReason(data);
            case TandemFeedbackMails.types.NEW_LANG:
                return sendNewFeature(data);
        }
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Private functions


///////////////////////////////////////////////////////////////////////////////////////////////	Mail Types functions

/**
 * Straightforward
 **/
function sendReport(data) {

    if (!data.userFrom || !data.userTo || !data.reason) {
        return false;
    }

    return sendEmail(data,
        TandemFeedbackMails.mails.NEW_REPORT_MAIL,
        "UniTandem - Report between users",
        getReportContent(data));

}

/**
 * Straightforward
 **/
function sendUnmatchReason(data) {
    if (!data.userFrom || !data.userTo || !data.reason) {
        return false;
    }

    return sendEmail(data,
        TandemFeedbackMails.mails.SET_UNMATCH_MAIL,
        "UniTandem - Unmatching request",
        getUnmatchContent(data));
}

/**
 * Straightforward
 **/
function sendNewFeature(data) {
    if (!data.userFrom || !data.reason) {
        return false;
    }

    return sendEmail(data,
        TandemFeedbackMails.mails.ADD_LANG_MAIL,
        "UniTandem - New Language Request",
        getFeatureContent(data));
}


///////////////////////////////////////////////////////////////////////////////////////////////	Mail Content functions

/**
 * Straightforward
 **/
function getFeatureContent(data){
    const user = Users.findOneById(data.userFrom);
    return "<h3>The user "
        + user.username
        + "( "
        + user.emails[0].address
        + " ) requested a new Language feature.</h3><p>Message: "
        + data.reason + "</p>";
}

/**
 * Straightforward
 **/
function getReportContent(data){
    const userFrom = Users.findOneById(data.userFrom);
    const userTo = Users.findOneById(data.userTo);

    return "<h3>The user "
        + userFrom.username
        + "( "
        + userFrom.emails[0].address
        + " ) send a report on the user: "
        + userTo.username
        + " ( "
        + userTo.emails[0].address
        + " )</h3><p>Reason: "
        + data.reason
        + "</p>";
}

/**
 * Straightforward
 **/
function getUnmatchContent(data){
    const userFrom = Users.findOneById(data.userFrom);
    const userTo = Users.findOneById(data.userTo);

    return "<h3>The user "
        + userFrom.username
        + "( "
        + userFrom.emails[0].address
        + " ) unmatched the user: "
        + userTo.username
        + " ( "
        + userTo.emails[0].address
        + " )</h3><p>Reason: "
        + data.reason
        + "</p>";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Straightforward
 **/
function sendEmail(data, fallbackEmail, subject, content) {

    if (TandemFeedbackMails.config.use_admin_emails) {
        const admins = Users.findUsersInRoles(['admin']).fetch();
        admins.map(function (admin) {
            const email = admin.emails[0].address;
            const from = Meteor.user().name;
            if (!TandemFeedbackMails.config.test_mode){
                return Mailer.send({
                    to: email,
                    from: from,
                    subject: subject,
                    html: content,
                });
            }
            else return true;
        });
    }
    else {
        const email = fallbackEmail;
        const from = Meteor.user().name;
        if (!TandemFeedbackMails.config.test_mode){
            return Mailer.send({
                to: email,
                from: from,
                subject: subject,
                html: content,
            });
        }
        else return true;
    }
}