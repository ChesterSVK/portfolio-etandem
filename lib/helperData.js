/*
	Part of TandemUserLanguages.
	Teaching motivation data.
	User wants to either learn new language or teach some.
*/
export const TeachingMotivationEnum = {
    WTTEACH: "WTTEACH",
    WTLEARN: "WTLEARN",
};

/*
	Part of TandemUsersMatches.
	After suitable language match was found user can execute request by matching users.
	This match can have state with these values
*/
export const MatchingRequestStateEnum = {
    ACCEPTED: "ACCEPTED",
    DECLINED: "DECLINED",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
};

/*
    Order dependent, please DO NOT change the order of these values.
    Comparison based on the order is implemented in the files like e.g. in the getLevelsAsArray function.
    This object determines a Language skill level used in TandemUserLanguages.
*/
export const LanguageLevelsEnum = {
    A1: "tdll_a1",
    A2: "tdll_a2",
    B1: "tdll_b1",
    B2: "tdll_b2",
    C1: "tdll_c1",
    C2: "tdll_c2"
};

// This function just transforms LanguageLevelsEnum into array used in .jsx files.
export const getLevelsAsArray = () => {
    const keys = Object.keys(LanguageLevelsEnum);
    return [
        {_id: LanguageLevelsEnum.A1, level: keys[0]},
        {_id: LanguageLevelsEnum.A2, level: keys[1]},
        {_id: LanguageLevelsEnum.B1, level: keys[2]},
        {_id: LanguageLevelsEnum.B2, level: keys[3]},
        {_id: LanguageLevelsEnum.C1, level: keys[4]},
        {_id: LanguageLevelsEnum.C2, level: keys[5]},
    ];
};