/*
	Configuration file for emailing options
*/

export const TandemFeedbackMails = {
	config: {
        // No mails will be sent if set to true
		test_mode: true,
        // If true emails will be sent to all admins not the mails listed in this configuration file
        use_admin_emails : false,
	},
    // All types of mails
	types: {
        REPORT : "Report",
        UNMATCH : "Unmatch",
        NEW_LANG : "New Language",
	},
    // All types of receivers of the mail
	mails: {
        ADD_LANG_MAIL : "jozefcibik@gmail.com",
        NEW_REPORT_MAIL : "jozefcibik@gmail.com",
        SET_UNMATCH_MAIL : "jozefcibik@gmail.com",
	}
};