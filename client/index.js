import './style.css'
// Views
////Admin
import './views/admin/tandemAdmin.html'
import './views/admin/tandemAdmin.js'
////404
import './views/404/pageNotFound.html'

import './views/tandemLanguageMatches.html'
import './views/tandemLanguageMatches.js'
import './views/tandemLanguagePreferences.html'
import './views/tandemLanguagePreferences'
import './views/tandemListMatches.html'
import './views/tandemListMatches'
// Components
import './components/tandemSidebar.html'
import './components/tandemSidebar'
import './components/tandemMatchingRequest.html'
import './components/tandemMatchingRequest'
import './components/loading/tandemLoading.html'
//Models
import TandemUsersMatches from './models/TandemUsersMatches';
import TandemUserLanguages from './models/TandemUserLanguages';
import TandemLanguages from './models/TandemLanguages';
import TandemLanguageMatches from './models/TandemLanguageMatches';



// import './message/tandemMessageTranslateAction.html'
// import './message/tandemMessageTranslateAction'

export {
	TandemUsersMatches,
	TandemUserLanguages,
	TandemLanguages,
	TandemLanguageMatches
}
