import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {settings} from 'meteor/rocketchat:settings';
import SimpleList from './react/SideBar/SideBar';
import {menu} from 'meteor/rocketchat:ui-utils';
import {handleError} from 'meteor/rocketchat:utils';
import './tandemSidebar.html';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	OnCreated

Template.tandemSidebar.onCreated(function () {
    // 1. Instance
    const instance = this;
    // 2. Variables
    this.hasUserMatches = new ReactiveVar(false);
    // 3. Autorun
    instance.autorun(function () {
        Meteor.call('hasUserMatches', function (error, results) {
            if (error) {
                handleError(error);
            }

            instance.hasUserMatches.set(results);
        });
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Events

Template.tandemSidebar.events({
    'click .tandem-link'() {
        menu.close();
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Helpers

Template.tandemSidebar.helpers({
    hasUserMatches() {
        return Template.instance().hasUserMatches.get();
    },
    TandemSidebar() {
        return SimpleList;
    }
});
