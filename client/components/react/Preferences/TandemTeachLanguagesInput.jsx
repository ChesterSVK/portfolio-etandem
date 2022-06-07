import TandemLanguages from '../../../models/TandemLanguages';
import {LanguageLevelsEnum} from '../../../../lib/helperData';
import {noLanguage, noLevel} from './TandemLanguageConstant'
import React from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        width: '90%',
        height: '100%',
        marginTop: 8,
        marginLeft: 8
    },
    languageNameContainer: {
        width: '55%',
        height: 45,
        marginTop: 16
    },
    paperLanguage: {
        float: 'right',
        width: '75%',
        height: '100%',
        maxWidth: 300,
        minWidth: 100,
        marginRight: 8
    },
    levelNameContainer: {
        width: '45%',
        height: 45,
        marginTop: 16
    },
    paperLevel: {
        float: 'left',
        width: '75%',
        height: '100%',
        maxWidth: 200,
        minWidth: 100,
        marginLeft: 8
    }
});


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        }
    },
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "left",

    }
};

function getAllowedLevels() {
    const levels = [Object.keys(LanguageLevelsEnum)[4], Object.keys(LanguageLevelsEnum)[5]];
    return levels.map(function (level) {
        return {_id: LanguageLevelsEnum[level], level: level}
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class TeachLanguagesInput extends React.Component {
    constructor(props) {
        super(props);

        const allLanguages = TandemLanguages.findAll().map(function (language) {
            return {_id: language._id, name: language.name}
        });
        this.state.allLanguages = allLanguages;
        const allLevel = getAllowedLevels();
        this.state.allLevel = allLevel;

        const lang = allLanguages.filter(language => props.languageId === language._id)[0];

        if (lang != null) {
            this.state.pickedLanguage = lang;
        }
        else {
            this.state.pickedLanguage = noLanguage;
        }

        const lvl = allLevel.filter(level => props.levelId === level._id)[0];
        if (lvl != null) {
            this.state.pickedLevel = lvl;
        }
        else {
            this.state.pickedLevel = noLevel;
        }

        this.state.allPickedLanguages = props.pickedLanguages
        this.state.unavailableLanguages = props.unavailableLanguages;
    }

    componentWillReceiveProps(nextProps) {
        let lang = this.state.allLanguages.filter(language => nextProps.languageId === language._id)[0];
        if (lang == null) {
            lang = noLanguage;
        }

        let lvl = this.state.allLevel.filter(level => nextProps.levelId === level._id)[0];
        if (lvl == null) {
            lvl = noLevel;
        }

        this.setState({
                pickedLanguage: lang,
                pickedLevel: lvl,
                allPickedLanguages: nextProps.pickedLanguages,
                unavailableLanguages: nextProps.unavailableLanguages
            }
            ,
            () => {
                //        console.log(this.state);
            });

    }

    state = {
        pickedLanguage: noLanguage,
        pickedLevel: noLevel,
        allLanguages: [],
        allLevel: []
    };

    handleChangeValue = event => {
        this.setState({[event.target.name]: event.target.value},
            () => {
                this.props.changeTeachLanguageValue(
                    this.state.pickedLanguage,
                    this.state.pickedLevel,
                    this.props.index
                )
            }
        );
    };


    render() {
        const {classes} = this.props;
        const allPickedLanguages = this.state.allPickedLanguages;
        const unavailableLanguages = this.state.unavailableLanguages;

        const languageMenu = this.state.allLanguages.map((language) => {
                let disabled = false;
                if (allPickedLanguages != null) {
                    const a = allPickedLanguages.filter(pickedLanguage => {
                        return (pickedLanguage.langId == language._id)
                    });
                    disabled = disabled || (a.length > 0);
                }
                if (unavailableLanguages != null) {
                    const a = unavailableLanguages.filter(unavailableLanguage => {
                        return (unavailableLanguage.langId == language._id)
                    });
                    disabled = disabled || (a.length > 0);
                }
                return <MenuItem
                    key={language._id}
                    value={language}
                    disabled={disabled}
                >
                    {language.name}
                </MenuItem>
            }
        );

        const levelMenu = this.state.allLevel.map((level) => {
                return <MenuItem
                    key={level._id}
                    value={level}>
                    {level.level}
                </MenuItem>
            }
        );

        return (
            <div className={classes.root}>
                <div className={classes.languageNameContainer}>
                    <Paper className={classes.paperLanguage}>
                        <FormControl className={classes.formControl}>
                            <Select
                                value={this.state.pickedLanguage}
                                onChange={this.handleChangeValue}
                                displayEmpty
                                name="pickedLanguage"
                                className={classes.selectEmpty}
                                MenuProps={MenuProps}
                                disableUnderline
                            >
                                <MenuItem value={noLanguage}>{noLanguage.name}</MenuItem>
                                {languageMenu}
                            </Select>
                        </FormControl>
                    </Paper>
                </div>

                <div className={classes.levelNameContainer}>
                    <Paper className={classes.paperLevel}>
                        <FormControl className={classes.formControl}>
                            <Select
                                value={this.state.pickedLevel}
                                onChange={this.handleChangeValue}
                                displayEmpty
                                name="pickedLevel"
                                className={classes.selectEmpty}
                                MenuProps={MenuProps}
                                disableUnderline
                            >
                                <MenuItem value={noLevel}>{noLevel.level}</MenuItem>
                                {levelMenu}
                            </Select>
                        </FormControl>
                    </Paper>


                </div>
            </div>
        );
    }
}

TeachLanguagesInput.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(TeachLanguagesInput);
