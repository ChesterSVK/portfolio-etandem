import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import TandemPreferences from '../components/react/Preferences/TandemPreferences';
import TandemLanguages from '../models/TandemLanguages'
import TandemUserLanguages from '../models/TandemUserLanguages'
import {TeachingMotivationEnum, getLevelsAsArray} from '../../lib/helperData'
import {t} from 'meteor/rocketchat:utils';
import {modal} from 'meteor/rocketchat:ui';
import {TandemFeedbackMails} from "../../lib/feedbackMails";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnCreated

Template.tandemLanguagePreferences.onCreated(function () {
    // 1. Instance
    const instance = this;
    this.languages = new ReactiveVar([]);
    this.languageLevels = getLevelsAsArray();
    this.teachingLanguages = new ReactiveVar([]);
    this.learningLanguages = new ReactiveVar([]);

    // 2. Autorun
    instance.autorun(function () {
        // subscribe to the posts publication
        let subscriptionLanguages = instance.subscribe('tandemLanguages');
        let subscriptionUserLanguages = instance.subscribe('tandemUserLanguages');

        // if subscription is ready, init structures
        if (subscriptionLanguages.ready()) {
            instance.languages.set(TandemLanguages.find({}).fetch());
        }

        // if subscription is ready, init structures
        if (subscriptionUserLanguages.ready()) {
            instance.teachingLanguages.set(
                TandemUserLanguages.findLanguagesWithMotivation(TeachingMotivationEnum.WTTEACH).fetch());
            instance.learningLanguages.set(
                TandemUserLanguages.findLanguagesWithMotivation(TeachingMotivationEnum.WTLEARN).fetch());
        }

    });
})
;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnRendered

Template.tandemLanguagePreferences.onRendered(function () {
    $('#tandemLoading').hide();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Events

Template.tandemLanguagePreferences.events({
    'click .tandem-more-languages-button'(){
        return modal.open({
                title: t('new_language_request'),
                text: t('new_language_request_text'),
                type: 'input',
                inputType: 'text',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: t('Send'),
                cancelButtonText: t('Cancel'),
                closeOnConfirm: true,
                html: false,
            }, (reason) => {
                Meteor.call('tandemSendEmail', TandemFeedbackMails.types.NEW_LANG, { userFrom: Meteor.userId(), reason: reason}, (error, result) => {
                    if (error) {
                        modal.open({
                            title: t('Operation_failed'),
                            type: 'error',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                    if (result) {
                        modal.open({
                            title: t('Success'),
                            type: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                })
            },
        );
    }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Helpers

Template.tandemLanguagePreferences.helpers({
    title() {
        return t("Preferences");
    },
    getLearningPreferences() {
        return Template.instance().learningLanguages.get();
    },
    getTeachingPreferences() {
        return Template.instance().teachingLanguages.get();
    },
    getTandemLanguages() {
        return Template.instance().languages.get();
    },
    getTandemLanguageLevels() {
        return Template.instance().languageLevels.get();
    },
    TandemPreferences() {
        return TandemPreferences;
    }
});
