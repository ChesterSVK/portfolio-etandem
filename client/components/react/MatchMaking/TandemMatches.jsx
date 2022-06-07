import {t} from 'meteor/rocketchat:utils';
import MatchProfileModal from "./MatchProfileModal";
import React from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {withStyles} from '@material-ui/core/styles';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    fullWidth: {
        width: "100%",
    },
    bottomMargin: {
        marginBottom: '2.5em',
    },
    title: {
        color: '#fff',
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    preferencesLink: {
        color: '#3f51b5'
    },
    cardContent: {
        padding: '0'
    },
    gridListTile: {
        height: "100% !important",
        maxWidth: "300px",
        minWidth: 178
    },
    gridListTileBar: {
        background: "#3f51b5",
    },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class TandemMatches extends React.Component {
    state = {
        userMatches: [],
        open: false,
    };

    componentWillReceiveProps(nextProps) {
        const matches = nextProps.languageMatches;
        this.setState(
            {
                userMatches: matches
            }
        );
    }

    openModal = () => {
        this.setState({open: true})
    };

    handleClose = () => {
        this.setState({open: false});
    };

    getMatchesTiles(item, classes) {
        return (
            item.matches.length === 0 ? (
                <Typography variant="h5" gutterBottom>
                    <Typography variant="overline" gutterBottom>
                        {t("No_matches_found_for")} {item.languageName}
                    </Typography>
                    <Link href="/languagePreferences" className={classes.preferencesLink}>
                        {t("Edit_your_preferences")}
                    </Link>
                </Typography>
            ) : (
                <div className={classes.fullWidth}>
                    <GridList className={classes.gridList} cols={4}>
                        {
                            item.matches.map((match, key) =>
                                <GridListTile key={match.teacher.username + key}
                                              className={classes.gridListTile}>
                                    <MatchProfileModal
                                        match={match}/>
                                </GridListTile>
                            )
                        }
                    </GridList>
                </div>
            )
        )
    }

    getAlreadyExistsDiv(item, classes) {
        return (<ListItem key={item.languageName}
                          className={classes.fullWidth + ' ' + classes.bottomMargin}>
            <Typography variant="h5" gutterBottom>
                <Typography variant="overline" gutterBottom>
                    {t("Existing_match_found_for")} {item.languageName}
                </Typography>
                <Link href="/listMatches" className={classes.preferencesLink}>
                    {t("See_your_matches")}
                </Link>
            </Typography>
        </ListItem>)
    }

    getMatchesList(item, classes) {
        return (<ListItem
            key={item.languageName}
            className={classes.fullWidth + ' ' + classes.bottomMargin}>
            <div className={classes.fullWidth} key={item.languageName}>
                <div className={classes.fullWidth}>
                    <ListItemText className={classes.bottomMargin}>
                        <Typography variant="overline" gutterBottom>
                            {t("Can_teach") + ' ' + item.languageName + ":"}
                        </Typography>
                    </ListItemText>
                </div>
                {
                    this.getMatchesTiles(item, classes)
                }
            </div>
        </ListItem>);
    }


    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <List component="nav" className={classes.fullWidth}>
                    {
                        this.state.userMatches.map(item => {
                            return item.alreadyExists ? (
                                this.getAlreadyExistsDiv(item, classes)
                            ) : (
                                this.getMatchesList(item, classes)
                            )
                        })
                    }
                </List>
            </div>
        );
    }
}

TandemMatches.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TandemMatches);
