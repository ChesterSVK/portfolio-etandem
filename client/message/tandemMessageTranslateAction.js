import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {Session} from "meteor/session";
import { ReactiveVar } from 'meteor/reactive-var';
import { MessageAction } from 'meteor/rocketchat:ui-utils';
import { Blaze } from 'meteor/blaze'

import {settings} from 'meteor/rocketchat:settings';
import TandemMatches from '../components/react/MatchMaking/TandemMatches'
import {t, handleError} from 'meteor/rocketchat:utils';
import './tandemMessageTranslateAction.html'

Meteor.startup(async function() {
    MessageAction.addButton({
        id: 'translate-message',
        icon: 'message',
        label: 'Translate',
        context: ['message', 'message-mobile'],
        action() {
            const message = this._arguments[1];
            $('#' + message._id).find('.tandem-translated-message').show();
        },
        condition(message) {
            // return !($('#' + message._id).find('.tandem-translated-message')[0].is(":visible"));
            return true;
        },
        order: 7,
        group: 'menu',
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnCreated

Template.tandemMessageTranslateAction.onCreated(function () {
    // 1. Instance
    const instance = this;
    instance.userMatch = new ReactiveVar({});
    // 2. Autorun
    instance.autorun(function () {

    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Helpers

Template.tandemMessageTranslateAction.helpers({
    isLoading(){
        return false;
    },
    showTranslation(){
        if (Template.instance().data.t === 'jitsi_call_started' || Template.instance().data.msg === ''){
            return false;
        }
        return Template.instance();
    },
    translatedMessage(){
        return {
            text: "Test",
            languages: ['Lang1', 'Lang2']
        }
    },
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Events

