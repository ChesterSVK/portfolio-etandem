import {Meteor} from 'meteor/meteor';
import {t, handleError} from 'meteor/rocketchat:utils';
import {getUserPreference} from 'meteor/rocketchat:utils';
import toastr from "toastr";
import React from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Custom Functions
const success = function success(fn) {
    return function (error, result) {
        if (error) {
            handleError(error);
        }
        if (result) {
            fn.call(this, result);
        }
    };
};

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
        width: '40%',
        height: 45,
        marginTop: 16
    },
    paperLanguage: {
        float: 'right',
        width: '95%',
        height: '100%',
        maxWidth: 300,
        minWidth: 100,
        marginLeft: 8
    },
    levelNameContainer: {
        width: '60%',
        height: 45,
        marginTop: 16
    },
    paperLevel: {
        float: 'left',
        width: '45%',
        height: '100%',
        maxWidth: 300,
        marginLeft: 8
    },
    creditNameContainer: {
        width: '25%',
        height: 45,
        marginTop: 16
    },
    paperCredit: {
        float: 'left',
        width: '45%',
        height: '100%',
        maxWidth: 300,
        marginLeft: 8
    },
    card: {
        minWidth: 275,
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    buttonHolder: {
        display: 'block',
        textAlign: 'right',
        width: '100%',
        marginTop: '1em',
    },
    list: {
        width: '100%',
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class TandemGeneralPreferencesInput extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        checkedExcluded: getUserPreference(Meteor.user(), 'tandemExcludeFromMatching', false),
        checkedAllowMultipleTeachings: getUserPreference(Meteor.user(), 'tandemAllowMultipleTeachings', false),
    };

    handleChange = name => event => {
        this.setState({[name]: event.target.checked});
        if (name === "checkedSymetricMatching") {
            if (event.target.checked === false) {
                this.state.checkedSymetricLangs = true;
            }
        }
    };

    handleSave = () => {
        Meteor.call('reloadLanguageMatching',
            {
                tandemExcludeFromMatching: this.state.checkedExcluded,
                tandemAllowMultipleTeachings: this.state.checkedAllowMultipleTeachings,
            },
            success(() => toastr.success(t("Message_Saving_Preference"), t("Title_Saving_Preference"))));
    }

    getExcludedItem(classes) {
        return (
            <ListItem>
                <ListItemText primary={t("matchmaking_preference_excluded")}/>
                <FormControlLabel
                    control={
                        <Switch
                            checked={this.state.checkedExcluded}
                            onChange={this.handleChange('checkedExcluded')}
                            value="checkedExcluded"
                            color="primary"
                        />
                    }
                    label={this.state.checkedExcluded ? t("Yes") : t("No")}
                />
                <Tooltip title={t("matchmaking_preference_excluded_i")}
                         aria-label={t("matchmaking_preference_excluded_i")}>
                    <IconButton className={classes.infoButton} size="big">
                        <InfoIcon fontSize="large" color="secondary"/>
                    </IconButton>
                </Tooltip>
            </ListItem>
        )
    }

    getMultipleTeachingsItem(classes) {
        return (
            <ListItem>
                <ListItemText primary={t("matchmaking_preference_multiple_teachings")}/>
                <FormControlLabel
                    control={
                        <Switch
                            checked={this.state.checkedAllowMultipleTeachings}
                            onChange={this.handleChange('checkedAllowMultipleTeachings')}
                            value="checkedAllowMultipleTeachings"
                            color="primary"
                            disabled={this.state.checkedExcluded}
                        />
                    }
                    label={this.state.checkedAllowMultipleTeachings ? t("Yes") : t("No")}/>
                <Tooltip title={t("matchmaking_preference_multiple_teachings_i")}
                         aria-label={t("matchmaking_preference_multiple_teachings_i")}>
                    <IconButton className={classes.infoButton} size="big">
                        <InfoIcon fontSize="large" color="secondary"/>
                    </IconButton>
                </Tooltip>
            </ListItem>)
    }

    getSaveBtn(classes) {
        return (
            <div className={classes.buttonHolder}>
                <Button type="submit"
                        variant="contained"
                        color="primary"
                        onClick={this.handleSave}
                        className={classes.button}>
                    {t("Save")}
                </Button>
            </div>
        )
    }

    render() {
        const {classes} = this.props;
        return (
            <Card className={classes.card}>
                <CardContent>
                    <FormGroup row>
                        <List component="nav" className={classes.list}>
                            {
                                this.getExcludedItem(classes)
                            }
                            <Divider/>
                            {
                                this.getMultipleTeachingsItem(classes)
                            }
                            <Divider/>
                        </List>
                        {
                            this.getSaveBtn(classes)
                        }
                    </FormGroup>
                </CardContent>
            </Card>
        );
    }

}

TandemGeneralPreferencesInput.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(TandemGeneralPreferencesInput);
