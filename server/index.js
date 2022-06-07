/*
	Load all necessary files and data from this file
*/

// Methods
import './methods/tandemAdminMethods';
import './methods/tandemUserLanguages';
import './methods/tandemUserMatches';
import './methods/tandemUserLanguageMatches';
import './methods/unmatchRoom';
import './methods/hasUserMatches';
import './methods/reportUserInRoom';
import './methods/executeLanguageMatching';
import './methods/reloadLanguageMatching';
import './methods/tandemSendEmail';
// Publications
import './publications/tandemUserLanguages';
import './publications/tandemLanguages';
// Models
import TandemUserLanguages from './models/TandemUserLanguages';
import TandemUserMatches from './models/TandemUsersMatches';
import TandemLanguages from './models/TandemLanguages';
import TandemLanguageMatches from './models/TandemLanguageMatches';
//Startup
import './startup';
import './startupForAuthorizations';

/*
	Even though no package is dependent on this package this code may or may not be here so far
*/
export {
	TandemUserLanguages,
	TandemUserMatches,
	TandemLanguages,
	TandemLanguageMatches
}
