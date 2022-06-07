import {Meteor} from 'meteor/meteor';
import {t} from 'meteor/rocketchat:utils';
import React from 'react';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI

import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ListIcon from '@material-ui/icons/List';
import SchoolIcon from '@material-ui/icons/School';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import PeopleIcon from '@material-ui/icons/People';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = theme => ({
    root: {
        width: '100%',
    },
    userName: {
        textAlign: "center",
        fontSize: "1.5em",
        marginBottom: "1em"
    },
    no_padding: {
        padding: '0',
    },
    no_padding_bottom: {
        paddingBottom: '0',
    },
    divider: {
        marginBottom: '0.8em',
    }
});

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

// Tandem routes defined in 'client/routes/router.js'

function SimpleList(props) {
    const {classes} = props;
    return (
        <div className={classes.root}>
            <h3 className={classes.userName}>
                {Meteor.user().name}
            </h3>
            <Divider className={classes.divider}/>
            {props.showListMatchesLink &&
            <List component="nav">
                <h3 className={"rooms-list__type " + classes.no_padding_bottom}>
                    <ListItemLink href="/listMatches" className={"sidebar-item tandem-link"}>
                        <ListItemIcon>
                            <AssignmentIndIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t('My_matches')}/>
                    </ListItemLink>
                </h3>
            </List>
            }
            <List component="nav">
                <h3 className={"rooms-list__type " + classes.no_padding_bottom}>
                    <ListItemLink href="/languageMatches" className={"sidebar-item tandem-link"}>
                        <ListItemIcon>
                            <PeopleIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t('Matchmaking')}/>
                    </ListItemLink>
                </h3>
            </List>
            <List component="nav">
                <h3 className={"rooms-list__type " + classes.no_padding_bottom}>
                    <ListItemLink href="https://digicampus.fi/course/view.php?id=33" target="_blank"
                                  className={"sidebar-item tandem-link"}>
                        <ListItemIcon>
                            <SchoolIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Moodle"/>
                    </ListItemLink>
                </h3>
            </List>
            <List component="nav">
                <h3 className={"rooms-list__type " + classes.no_padding_bottom}>
                    <ListItemLink href="/languagePreferences" className={"sidebar-item tandem-link"}>
                        <ListItemIcon>
                            <ListIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t('Preferences')}/>
                    </ListItemLink>
                </h3>
            </List>
            <Divider/>
        </div>
    );
}

SimpleList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleList);
