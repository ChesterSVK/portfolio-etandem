
#Tandem Integration guide for the Rocketchat version 0.74

# 1. Download stable version

$ git clone https://github.com/RocketChat/Rocket.Chat.git
$ git checkout 0.74.3
$ cd Rocket.Chat
$ example-build.sh (Will fail on the first time, but downloads additional packages)

# 2. Setup important environment variables and data

Todo

# 3. Prepare mongo database

Todo

# 4. Create development run script eTandem-build.sh, to be able to do reactive and quick changes to the running instance
    
```
#!/bin/bash
#set -x
#set -euvo pipefail
#IFS=$'\n\t'

# Requires Node.js version 4.x
# Do not run as root

#DEPLOY_DIR=/home/developer/sftpRoot/Rocket.Deploy

### BUILD
#meteor npm install
#meteor npm run postinstall

# on the very first build, meteor build command should fail due to a bug on emojione package (related to phantomjs installation)
# the command below forces the error to happen before build command (not needed on subsequent builds)
#set +e
#meteor add rocketchat:lib
#set -e

#meteor build --server-only --directory $DEPLOY_DIR

### RUN
#cd $DEPLOY_DIR/bundle/programs/server
#npm install

#cd $DEPLOY_DIR/bundle
NODE_ENV=developement \
PORT=3000 \
ROOT_URL=http://suikero.tech:3000 \
MAIL_URL=smtp://suikkis@suikero.tech:klkrisek1@smtp.mailgun.org:587 \
MONGO_URL=mongodb://localhost:27017/rocketchat \
MONGO_OPLOG_URL=mongodb://localhost:27017/local?replSet=rs01 \
meteor npm start
```


# 5. Start the script, follow setup wizard and in administration set configuration:

>###Permissions for User:
>See images in the packages/rocketchat-tandem/assets/images/permissions folder
>#####*for some permissions (with tandem prefix) you need to download the package first, see step 7

>###Rooms:
>Delete general room

>###Accounts:
>>####Default Directory Listing:
>> Users
>>####Default User Preferences:
>>> #####Group By Type:
>>>False

>###General:
>>####Enable Favourite Rooms:
>> False

>###Layout:
>>####User Interface:
>>>#####Group Channels by type:
>>> False
>>>#####Show roles
>>> False
>>>#####Allow special characters in room names
>>> True
>>>#####Click to create direct message:
>>> False
>>####Colors:
>>>>#####Primary:
>>>>\#ffffff
>>####Custom CSS:
>>>>
```
.sidebar__header {
    display: block;
}

.sidebar__toolbar {
    display: block;
    width: 100%;
    margin: 0;
    text-align: center;
}

.sidebar__header-thumb {
    display: block;
    margin: 1em auto;
    height: 140px;
    width: 140px;
}

.sidebar__header-status-bullet {
    width: 152px;
    height: 152px;
    bottom: -6px;
    right: -6px;
    border-radius: 0;
    position: absolute;
    z-index: -1;
    border: 0;
}

.sidebar__footer {
    text-align: center;
}

.rc-header__block {
    margin: 0;
}

.rc-old .page-container .content {
    display: block;
}

.sidebar {

    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);

    background-color: #fff;

}

.sidebar-item--unread, .sidebar-item--mention {
    color: #9ea2a8;
}

@media only screen and (max-width: 500px) {
    .sidebar__header-thumb {
        height: 100px;
        width: 100px;
    }

    .sidebar__header-status-bullet {
        width: 112px;
        height: 112px;
    }
}
```

>###Accounts
>>####Default Preferences:
>>>#####Sidebar channels mode: 
>>>Extended
>###Logs (Debugging purposes)
>>####Log Level:
>>2
>>####Show package:
>>true
>>####Show file:
>>true
>>####Trace:
>>true

>###Messages
>>####Messages to yourself:
>>false
>>####Hex preview:
>>false
>>####Autolinker:
>>false
>>####Katex - Enabled: 
>>false

>###Nice details configuration to think about:
>>###Emails
>>###Layout

# 6. Add react, material-ui, blaze to react, react to blaze support:
##Links: 
[react-template-helper](https://atmospherejs.com/meteor/react-template-helper), 
[blaze-react-component](https://atmospherejs.com/gadicc/blaze-react-component), 
[Material-UI](https://material-ui.com/)

> `meteor npm install --save react react-dom prop-types @material-ui/core @material-ui/icons history`

> `meteor add react-template-helper`

> `meteor add gadicc:blaze-react-component`

# 7. Add Tandem Package
>clone or copy to specific folder `git clone https://github.com/ChesterSVK/eTandem.git packages/rocketchat-tandem`
>change branch  `git checkout rocketchat-tandem-package`
> ##Install:
>> `meteor add rocketchat:tandem`
>> - do not forget to rebuild

#8. Modify Rocketchat's files

>##Warning: Please execute the changes one by one and check if they are working properly in case some details are missing (Mostly typos and undefined imports). Also do not forget to backup original files.

>##Tandem routing
>Copy File: `packages/rocketchat-tandem/copies/client_routes_router/router.js` to `client/routes/router.js` 

>##Tandem sidebar section, with click event 
>File: `packages/rocketchat-sidenav/client/sideNav.html`
```
<!--Tandem-->
<div class="tandem-links">
    {{> tandemSidebar }}
</div>
```
>File: `packages/rocketchat-sidenav/client/sideNav.js`
```
...
    // Tandem
	'click .tandem-preference-link'(e) {
		// Prevent default browser form submit
		e.preventDefault();

		// Get value from form element
		const target = e.target;
		const href = target.getAttribute("href");

		FlowRouter.go(href);
	},
...


    //Tandem
    // Autorun
    // const userPref = getUserPreference(user, 'sidebarGroupByType');
	const userPref = getUserPreference(user, 'sidebarGroupByType', false);
...
```

>##Tandem sidebar avatar
>>Switched avatar position with buttons position in
>File: `packages/rocketchat-sidenav/client/sidebarHeader.html`

>##Modify user sidebar options according to permissions with checks
>File: `packages/rocketchat-sidenav/client/sidebarHeader.js`
```
    ...
    const toolbarButtons = (user) => [{
    	name: t('Search'),
    	icon: 'magnifier',
    	condition: () => hasAtLeastOnePermission(['tandem-search']),
    	action: () => {
    		toolbarSearch.show(false);
    	},
    },
    {
    	name: t('Directory'),
    	icon: 'discover',
    	condition: () => hasAtLeastOnePermission(['tandem-view-directory']),
    	action: () => {
    		menu.close();
    		FlowRouter.go('directory');
    	},
    },
    
    {
        name: t('View_mode'),
        icon: () => viewModeIcon[getUserPreference(user, 'sidebarViewMode') || 'condensed'],
        // Tandem
        condition: () => hasAtLeastOnePermission(['tandem-ui-view-mode']),
        ...
    
    ...
    
    {
    	name: t('Sort'),
    	icon: 'sort',
    	condition: () => hasAtLeastOnePermission(['tandem-ui-sort']),
    	action: (e) => {
    		const options = [];
    		const config = {
    			template: 'sortlist',
    			currentTarget: e.currentTarget,
    			data: {
    				options,
    			},
    			offsetVertical: e.currentTarget.clientHeight + 10,
    		};
    		popover.open(config);
    	},
    },
    ...
```

>##Added permission on hide 
>File: `packages/rocketchat-sidenav/client/sidebarItem.js`
```
...

        //Tandem
                const canHide = () => {
                    if (!hasAtLeastOnePermission('tandem-hide')) { return false; }
                    else return true;
        		};
                
        		const items = [];
        
        		//Tandem
                if (canHide()) {
                    items.push({
                        icon: 'eye-off',
                        name: t('Hide_room'),
                        type: 'sidebar-item',
                        id: 'hide',
                    });
                }

...

```


>##Added unmatch possibility, which is modified eraseRoom function
>File: `packages/rocketchat-ui-utils/client/lib/ChannelActions.js`
```
...
// Tandem
export async function unmatch(type, rid) {
	modal.open({
		title: t('Are_you_sure'),
		text: t('Delete_Room_Warning'),
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: t('Yes_delete_it'),
		cancelButtonText: t('Cancel'),
		closeOnConfirm: false,
		html: false,
	}, async function(isConfirm) {
		if (!isConfirm) {
			return;
		}
		try {
			await call('eraseRoom', rid);
		} catch (error) {
			return modal.open({
				type: 'error',
				title: t('Warning'),
				text: handleError(error, false),
				html: false,
			});
		}
		try {
			await call('unmatchRoom', rid);
			modal.open({
				title: t('Deleted'),
				text: t('Room_has_been_deleted'),
				type: 'success',
				showConfirmButton: true,
				confirmButtonText: t('OK'),
			}, function () {
				document.location.reload(true);
			});
		} catch (error) {
			return modal.open({
				type: 'error',
				title: t('Warning'),
				text: handleError(error, false),
				html: false,
			});
		}

	});
}

...
```
>>*Method unmatch defined in `rocketchat-tandem/server/methods`


>##Added reporting user with email to tandem admins

>File: `packages/rocketchat-ui-flextab/package.js`
```
//Packages
        'mongo',
		'ecmascript',
		'templating',
		'rocketchat:utils',
		'rocketchat:models',
		'rocketchat:lib',
		'rocketchat:ui-utils',
		'rocketchat:settings',
		'rocketchat:authorization',
		'mizzao:autocomplete',
		'rocketchat:webrtc',
```
>File: `packages/rocketchat-ui-flextab/client/tabs/userActions.js`
```
...
// Tandem
import {hasAllPermission, hasRole} from 'meteor/rocketchat:authorization';
...

		// Tandem
    	const canReportUser = () => hasPermission('tandem-report-user', Session.get('openedRoom'));
    	
...
//Add to action functions array 

// Tandem
		, () => {
			if (!canReportUser()) {
				return;
			}
			return {
				group: 'channel',
				icon: 'warning',
				name: t('Report_user'),
				action: prevent(getUser, ({username}) => {
					const rid = Session.get('openedRoom');
					const room = ChatRoom.findOne(rid);
					if (!hasPermission('tandem-report-user')) {
						return toastr.error(TAPi18n.__('error-not-allowed'));
					}
					modal.open({
							title: t('Are_you_sure'),
							text: t('Reason?'),
							type: 'input',
							inputType: 'text',
							showCancelButton: true,
							confirmButtonColor: '#DD6B55',
							confirmButtonText: t('Yes_report_user'),
							cancelButtonText: t('Cancel'),
							closeOnConfirm: false,
							html: false,
						}, (reason) => {
							Meteor.call('reportUserInRoom', {rid, username, reason}, success(() => {
								modal.open({
									title: t('Reported'),
									text: t('User_has_been_reported'),
									type: 'success',
									timer: 2000,
									showConfirmButton: false,
								});
							}))
						},
					);
				}),
			};
		}

```
>>method defined in tandem-package/server/methods/reportUserInRoom.js

>##Added translation files

>File: `copy copies/rocketchat_i18n_i18n/tocketchat-tandem.*.i18n.json to packages/rocketchat-i18n/i18n/`


>##Added login fader
>>Modified login template 
>>File: `packages\rocketchat-ui-login\client\login\layout.html`
>>
```
<template name="loginLayout">
	<section class="rc-old full-page color-tertiary-font-color" style="{{#with backgroundUrl}}background-image: url('{{.}}'){{/with}}">
		<div class="shader rc-old full-page" style="background-color: rgba(255,255,255,0.5);">
			<div class="wrapper">
				{{> loginHeader }}
				{{> Template.dynamic template=center}}
				{{> loginFooter }}
			</div>
		</div>
	</section>
</template>
```


>##Added matching request window
>>Modified room layout
>>File: `packages\rocketchat-ui\client\views\app\room.html`
>>
```
header
...

{{> tandemMatchingRequest roomId=getRoomId}}

...
message section
```
>>File: `packages\rocketchat-ui\client\views\app\room.js`
>>
```
// Tandem
	getRoomId(){
		return this._id
	},
```


>##Modified channel settings
>###Added additional permission condition to rocketchat channel
>>File: `packages\rocketchat-channel-settings\client\views\channelSettings.js`
>>
```
    canLeaveRoom() {
		const { cl: canLeave, t: roomType } = Template.instance().room;
		if (roomType === 'c'){
        			return  canLeave !== false && hasPermission(Meteor.userId(), 'leave-c');
        		}
        		if (roomType === 'p'){
        			return  canLeave !== false && hasPermission(Meteor.userId(), 'leave-p');
        		}
		return roomType !== 'd' && canLeave !== false;
	},
``` 

>##Commented / Deleted out channel description, hide button and announcements
>>File: `packages\rocketchat-channel-settings\client\views\channelSettings.html`

>##Added umatch posibility
>>File: `packages\rocketchat-channel-settings\client\views\channelSettings.html`
>>
```
    {{#if canUnmatchRoom}}
    		<button class="rc-button rc-button-outline rc-button-cancel js-unmatch rc-button--cancel rc-button--stack" title="{{_ 'Unmatch'}}">{{> icon icon='trash'}}{{_ 'Unmatch'}}</button>
    	{{/if}}
``` 
>>File: `packages\rocketchat-channel-settings\client\views\channelSettings.js`
>>
```
import { modal, popover, call, erase, hide, leave, unmatch } from 'meteor/rocketchat:ui-utils';
import { hasPermission, hasAtLeastOnePermission } from 'meteor/rocketchat:authorization';
...

    canDeleteRoom() {
		const room = ChatRoom.findOne(this.rid, {
			fields: {
				t: 1,
			},
		});

		const roomType = room && room.t;
		return roomType && RocketChat.roomTypes.roomTypes[roomType].canBeDeleted(hasPermission, room) && !hasAtLeastOnePermission(['tandem-unmatch']);
	},
    canUnmatchRoom() {
    		return hasAtLeastOnePermission(['tandem-unmatch']);
    	},
    	
    	....
    	
    	
    	//Tandem
            'click .js-unmatch'(e, instance) {
                const { t: type } = instance.room;
                const rid = instance.room._id;
                return unmatch(type, rid);
            },
``` 

>>File: `packages\rocketchat-ui-utils\client\index.js`
>>
`export { erase, hide, leave, unmatch } from './lib/ChannelActions';`

>>File:  `packages\rocketchat-ui-utils\client\lib\ChannelActions.js`
>>
```
export async function unmatch(type, rid) {
    modal.open({
        title: t('Are_you_sure'),
        text: t('Unmatching_Room_Warning'),
        type: 'input',
        inputType: 'textarea',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: t('Yes_delete_it'),
        cancelButtonText: t('Cancel'),
        closeOnConfirm: false,
        html: false,
    }, async function(reason) {
        if (!reason) {
            return;
        }

        try {
            await call('eraseRoom', rid);
        } catch (error) {
            return modal.open({
                type: 'error',
                title: t('Warning'),
                text: handleError(error, false),
                html: false,
            });
        }
        try {
            await call('unmatchRoom', rid, reason);
            modal.open({
                title: t('Deleted'),
                text: t('Room_has_been_deleted'),
                type: 'success',
                showConfirmButton: true,
                confirmButtonText: t('OK'),
            }, function () {
                document.location.reload(true);
            });
        } catch (error) {
            return modal.open({
                type: 'error',
                title: t('Warning'),
                text: handleError(error, false),
                html: false,
            });
        }

    });
}

```


>##Added small ui condition on creating channels, reason : creating channels is allowed to admins only, but creating a match requires to have a create channel privileges
>>File: `packages\rocketchat-ui-sidenav\client\sidebarHeader.js`
>>
```
import {hasAllPermission, hasRole} from 'meteor/rocketchat:authorization';
...
{
	name: t('Create_A_New_Channel'),
	icon: 'edit-rounded',
	condition: () => hasAtLeastOnePermission(['create-c', 'create-p']) && (hasRole('admin') || hasRole('tandem-admin')),
	action: () => {
		menu.close();
		FlowRouter.go('create-channel');
	},
},
```

>##Added sentence about yourself
>>File: `packages\rocketchat-ui-account\client\accountProfile.html`
>>
```
<!--Tandem-->
							{{# with canChange=allowSentenceChange}}
								<div class="rc-input rc-w100 padded {{#if sentenceInvalid}}rc-input--error{{/if}}" style="padding: 15px;">
									<label class="rc-input__label">
										<div class="rc-input__title">{{_ "Sentence_about_yourself"}}</div>
										<div class="rc-input__wrapper">
											<input type="text" data-customfield="true" class="rc-input__element" name="sentence" id="sentence" placeholder="{{_ "Tell_us_about_yourself" }}" value="{{sentence}}" {{ifThenElse canChange '' 'disabled'}}>
										</div>
									</label>
									{{# unless canChange}}
										<div class="rc-input__description">{{_ 'Sentence_Change_Disabled'}}</div>
									{{/unless}}
								</div>
							{{/with}}
```
>>File: `packages\rocketchat-ui-account\client\accountProfile.js`
>>
```
// Tandem
const validateSentence = (sentence) => sentence && sentence.length;

// Tandem
	sentenceInvalid() {
		return !validateSentence(Template.instance().username.get());
	},
	
	
	// Tandem
    sentence() {
    	return Template.instance().sentence.get();
    },
    	
    	
    // Tandem
    allowSentenceChange() {
    	return Rocketchat.settings.get('Accounts_CustomFields');
    },
    
    
    //Tandem (On created)
    self.sentence = new ReactiveVar(user.customFields && user.customFields['tandemSentence'] !== undefined ? user.customFields['tandemSentence'] : "");
```
>>###Admin - Administration/Accounts/Registration/CustomFields
>>
```
{
  "tandemSentence" : "Hi I am new here."
}
```


>#Added mongo migration number 138

>File: `server/startup/migrations/v138.js`
>
```
import { Migrations } from 'meteor/rocketchat:migrations';
import { Settings } from 'meteor/rocketchat:models';

Migrations.add({
	version: 138,
	up() {
		Settings.remove({ _id: 'InternalHubot_Enabled' });
		Settings.remove({ _id: 'InternalHubot_Username' });
		Settings.remove({ _id: 'InternalHubot_ScriptsToLoad' });
		Settings.remove({ _id: 'InternalHubot_PathToLoadCustomScripts' });
		Settings.remove({ _id: 'InternalHubot_EnableForChannels' });
		Settings.remove({ _id: 'InternalHubot_EnableForPrivateGroups' });
		Settings.remove({ _id: 'InternalHubot_EnableForDirectMessages' });
	},
});
```


>#Removed general room in Administration UI and from startup
>File: `\server\startup\initialData.js`

>#---------------------------------------

>##Added UniTandem Adnimistration
>>File: `packages\rocketchat-ui-admin\client\adnimFlex.html`
>>
```
<!--Tandem-->
{{#if hasPermission 'tandem-developer'}}
    {{> sidebarItem menuItem "UniTandem" "hashtag" "tandemAdmin" "" }}
{{/if}}
```

>##Delete original 404 page
>>Delete File: `client\routes\pageNotFound.html`



# 9. Reports and bugs
>Voice recording not working due to import issues / js error not sure

>[issue 137445](https://github.com/RocketChat/Rocket.Chat/issues/13745)
