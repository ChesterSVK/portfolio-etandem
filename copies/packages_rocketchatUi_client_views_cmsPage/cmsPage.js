import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { settings } from 'meteor/rocketchat:settings';

Template.cmsPage.onCreated(function() {
	this.page = new ReactiveVar('');
	return Tracker.autorun(() => {
		const cmsPage = Session.get('cmsPage');
		if (cmsPage != null) {
			return this.page.set(settings.get(cmsPage));
		}
	});
});

function formatTextToHtml(param) {
	if (param !== undefined){
		return param.replace('\n', '<br>').replace(/\:/g, ':<br>').replace(/\;/g, ':<br>').replace(/\. /g,'.<br>').replace(/\d\./g, '');
	}
	else return '';
}

Template.cmsPage.helpers({
	page() {
		return formatTextToHtml(Template.instance().page.get());
	},
});

Template.cmsPage.events({
	'click .cms-page-close'() {
		return FlowRouter.go('/');
	},
});

Template.cmsPage.onRendered(function() {
	return $('#initial-page-loading').remove();
});
