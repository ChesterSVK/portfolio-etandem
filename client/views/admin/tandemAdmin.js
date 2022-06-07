import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {modal, ChatRoom, ChatSubscription, RoomRoles} from 'meteor/rocketchat:ui';

import {settings} from 'meteor/rocketchat:settings';
import {t, handleError} from 'meteor/rocketchat:utils';
import {Session} from "meteor/session";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnCreated

Template.tandemAdmin.onCreated(function () {
    // 1. Instance
    const instance = this;
    instance.languagePreferenceStatistics = new ReactiveVar([]);
    instance.generalStatistics = new ReactiveVar([]);
    // 2. Autorun
    instance.autorun(function () {
        Meteor.call('languagePreferenceStatistics', (error, result) => {
            if (result){
                instance.languagePreferenceStatistics.set(result);
            }
        });
        Meteor.call('generalStatistics', (error, result) => {
            if (result){
                instance.generalStatistics.set(result);
            }
        })
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Helpers

Template.tandemAdmin.helpers({
    title() {
        return t("UniTandem");
    },
    generalSettingsTitle() {
        return t("General_settings");
    },
    languageSettingsTitle() {
        return t("Language_settings");
    },
    developerSettingsTitle() {
        return t("Developer_settings");
    },
    infoLangTableData() {
        return {
            tableHeaderRows: [t('language_name'), t('language_taught'), t('language_learnt')],
            languageDataRows: Template.instance().languagePreferenceStatistics.get()
        };
    },
    infoGeneralFields() {
        return [
            {
                fieldName: t("Users"),
                fieldValue: Template.instance().generalStatistics.get()['users'],
            },
            {
                fieldName: t("admin_language_preferences"),
                fieldValue: Template.instance().generalStatistics.get()['language_preferences'],
            },
            {
                fieldName: t("admin_user_matches_a"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_a'],
            },
            {
                fieldName: t("admin_user_matches_d"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_d'],
            },
            {
                fieldName: t("admin_user_matches_p"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_p'],
            },
            {
                fieldName: t("admin_user_matches_c"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_c'],
            },
            {
                fieldName: t("admin_user_matches"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_all'],
            },
            {
                fieldName: t("admin_unmatched_matches"),
                fieldValue: Template.instance().generalStatistics.get()['user_matches_unmatched'],
            },
        ];
    },
    developerDatabaseOptions() {
        return [
            {
                optionName: t("Delete_all_user_matches_with_rooms"),
                optionButtonText: t("Delete"),
                actionId: "deleteAllUserMatchesBtn"
            },
            {
                optionName: t("Delete_all_language_matches"),
                optionButtonText: t("Delete"),
                actionId: "deleteAllLangMatchesBtn"
            },
            {
                optionName: t("Delete_all_user_language_preferences"),
                optionButtonText: t("Delete"),
                actionId: "deleteAllLangPreferencesBtn"
            }
        ];
    },
});

Template.tandemAdmin.events({
    'click .expand'(e) {
        const sectionTitle = e.currentTarget;
        const section = sectionTitle.closest('.section');
        const button = sectionTitle.querySelector('button');
        const i = button.querySelector('i');

        sectionTitle.classList.remove('expand');
        sectionTitle.classList.add('collapse');
        section.classList.remove('section-collapsed');
        button.setAttribute('title', TAPi18n.__('Collapse'));
        i.className = 'icon-angle-up';

        $('.CodeMirror').each(function (index, codeMirror) {
            codeMirror.CodeMirror.refresh();
        });
    },
    'click .collapse'(e) {
        const sectionTitle = e.currentTarget;
        const section = sectionTitle.closest('.section');
        const button = sectionTitle.querySelector('button');
        const i = button.querySelector('i');

        sectionTitle.classList.remove('collapse');
        sectionTitle.classList.add('expand');
        section.classList.add('section-collapsed');
        button.setAttribute('title', TAPi18n.__('Expand'));
        i.className = 'icon-angle-down';
    },

    'click #deleteAllLangMatchesBtn'(e) {
        return modal.open({
                title: t('Are_you_sure'),
                type: 'warning',
                text: t("This_will_delete_all_saved_data"),
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: t('Yes'),
                cancelButtonText: t('Cancel'),
                closeOnConfirm: true,
                html: false,
            }, () => {
                Meteor.call('deleteAllLanguageMatches', (error, result) => {
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
    },
    'click #deleteAllUserMatchesBtn'(e) {
        return modal.open({
                title: t('Are_you_sure'),
                type: 'warning',
                text: t("This_will_delete_all_saved_data"),
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: t('Yes'),
                cancelButtonText: t('Cancel'),
                closeOnConfirm: true,
                html: false,
            }, () => {
                Meteor.call('deleteAllUserMatches', (error, result) => {
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
    },
    'click #deleteAllLangPreferencesBtn'(e) {
        return modal.open({
                title: t('Are_you_sure'),
                type: 'warning',
                text: t("This_will_delete_all_saved_data"),
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: t('Yes'),
                cancelButtonText: t('Cancel'),
                closeOnConfirm: true,
                html: false,
            }, () => {
                Meteor.call('deleteAllLanguagePreferences', (error, result) => {
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

const prevent = function prevent(fn, ...args) {
    return function (e, {instance}) {
        e.stopPropagation();
        e.preventDefault();
        return fn.apply(instance, args);
    };
};

const getUser = function getUser(fn, ...args) {
    if (!user) {
        return;
    }
    return fn.apply(this, [user, ...args]);
};