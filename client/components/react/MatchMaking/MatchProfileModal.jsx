import {Meteor} from 'meteor/meteor';
import {settings} from 'meteor/rocketchat:settings';
import {getUserPreference} from 'meteor/rocketchat:utils';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {AutoComplete} from 'meteor/mizzao:autocomplete';
import {callbacks} from 'meteor/rocketchat:callbacks';
import {t, roomTypes} from 'meteor/rocketchat:utils';
import {hasAllPermission} from 'meteor/rocketchat:authorization';
import toastr from "toastr";
import React from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Blaze from 'meteor/gadicc:blaze-react-component';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = ({
    dialogRoot: {},
    dialogContent: {
        padding: 0,
    },
    avatarHolder: {
        maxWidth: "320px",
        margin: "auto",
    },
    dialogUserName: {
        opacity: 0.6,
        textAlign: "center",
        padding: "0.3em 1.3em",
        marginTop: "-1.8em",
        position: "relative",
    },
    listItem: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: "2em",
        paddingRight: "2em",
    },
    card: {
        maxWidth: 336,
        minWidth: 168,
        maxHeight: 576,
        margin: 5
    },
    media: {
        minHeight: 168,
    },
    h6: {
        fontSize: 16,
    },
    navHolder: {
        padding: "1em 1em 1em 0",
    },
    subh: {
        fontSize: 13,
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class MatchProfileModal extends React.Component {
    state = {
        open: false,
    };

    createChannel(match) {
        Meteor.call('tandemUserMatches/createMatchingRequest', match, function (err, result) {
            if (err) {
                toastr.error(t(err.error), t(err.reason));
            }
            else {
                toastr.success(t("success-creating-user-match"));
                return FlowRouter.go('group', {name: result.name}, FlowRouter.current().queryParams);
            }
        });

        return false;
    }

    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleRequest = (match) => {
        // console.log(match);
        this.createChannel(match);
        this.setState({open: false});
    };

    getTeachersLanguage = (langs, lang) => {
        if (langs.length !== 2) return "";
        if (langs[0] === lang) return langs[1];
        if (langs[1] === lang) return langs[0];
    };

    getCardData(props, classes) {
        return (
            <CardActionArea
                onClick={this.handleClickOpen}>
                <Blaze template="avatar"
                       username={props.match.teacher.username}/>
                <CardContent>
                    <Typography className={classes.h6} gutterBottom variant="h6" component="h2">
                        {props.match.teacher.username}
                    </Typography>
                    <Typography className={classes.subh} component="p">
                        {t("looks_for")}
                        {this.getTeachersLanguage(props.match.languagesInMatch, props.match.matchingLanguage)}
                    </Typography>
                </CardContent>
            </CardActionArea>
        )
    }

    getDialogData(state, props, classes) {
        return (
            <div>
                <DialogContent className={classes.dialogContent + '  tandem-dialog-content'}>
                    <div className={classes.avatarHolder}>
                        <Blaze template="avatar"
                               username={props.match.teacher.username}/>
                        <Typography variant="h4"
                                    className={classes.dialogUserName  + " sidebar__header-status-bullet--" + props.match.teacher.status}>
                            {this.props.match.teacher.name}
                        </Typography>
                    </div>
                    <List component="nav"
                          className={classes.navHolder}>
                        {props.match.teacher.customFields && props.match.teacher.customFields.tandemSentence ?
                            <ListItem className={classes.listItem}>
                                <div>
                                    <ListItemText secondary={t("about_me")}/>
                                    <ListItemText primary={props.match.teacher.customFields.tandemSentence}/>
                                </div>
                            </ListItem>
                            : ""}
                        <ListItem className={classes.listItem}>
                            <div>
                                <ListItemText secondary={t("teaches")}/>
                                <ListItemText primary={props.match.matchingLanguage}/>
                            </div>
                        </ListItem>
                        <ListItem className={classes.listItem}>
                            <div>
                                <ListItemText secondary={t("looks_for")}/>
                                <ListItemText
                                    primary={
                                        this.getTeachersLanguage(
                                            props.match.languagesInMatch,
                                            props.match.matchingLanguage)
                                    }/>
                            </div>
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        {t("Back")}
                    </Button>
                    <Button onClick={() => this.handleRequest(props.match)} color="primary" autoFocus>
                        {t("request_conversation")}
                    </Button>
                </DialogActions>
            </div>
        )
    }

    render() {
        const {classes} = this.props;

        return (
            <div>
                <Card className={classes.card}>
                    {
                        this.getCardData(this.props, classes)
                    }
                </Card>
                <Dialog
                    className={classes.dialogRoot}
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    {
                        this.getDialogData(this.state, this.props, classes)
                    }
                </Dialog>
            </div>
        );
    }
}

MatchProfileModal.propTypes = {
    classes: PropTypes.object.isRequired,
    username: PropTypes.string
};

export default withStyles(styles)(MatchProfileModal);
