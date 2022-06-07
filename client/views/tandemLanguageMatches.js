import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import {settings} from 'meteor/rocketchat:settings';
import TandemMatches from '../components/react/MatchMaking/TandemMatches'
import {t, handleError} from 'meteor/rocketchat:utils';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnCreated

Template.tandemLanguageMatches.onCreated(function () {
    // 1. Instance
    const instance = this;
    instance.userMatches = new ReactiveVar([]);
    // 2. Autorun
    instance.autorun(function () {
        Meteor.call('tandemUserLanguageMatches/get', function (error, results) {
            if (error) {
                handleError(error);
            }
            instance.userMatches.set(results);
        });
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Helpers

Template.tandemLanguageMatches.helpers({
    title() {
        return t("Matches");
    },
    MatchMaking() {
        return TandemMatches;
    },
    getLanguageMatches() {
        return Template.instance().userMatches.get();
    }
});
