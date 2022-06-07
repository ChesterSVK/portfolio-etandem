import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {MatchingRequestStateEnum} from "../../../../lib/helperData";
import {t, handleError} from 'meteor/rocketchat:utils';
import React, {Component} from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Blaze from 'meteor/gadicc:blaze-react-component';
import Button from '@material-ui/core/Button';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    listOfLanguageFriends: {
        [theme.breakpoints.up('sm')]: {
            marginLeft: 0,
            width: `100%`,
        },
    },
    card: {
        display: 'flex',
        height: 140,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
    },
    cardPending: {
        display: 'flex',
        height: 140,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
        background: "linear-gradient(90deg, rgba(255,210,31,1) 0%, rgba(255,255,255,0) 7%)"
    },
    cardCompleted: {
        display: 'flex',
        height: 140,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
        background: "linear-gradient(90deg, rgba(45,224,165,1) 0%, rgba(255,255,255,0) 7%)"
    },
    cardAccepted: {
        display: 'flex',
        height: 140,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
        background: "linear-gradient(90deg, rgba(23,92,196,1) 0%, rgba(255,255,255,0) 7%)"
    },
    details: {
        display: 'flex',
    },
    content: {
        flex: '1 0 auto',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    yourStudentsTitle: {
        paddingLeft: 15,
        marginBottom: 15
    },
    emptyTitle: {
        padding: 15,
    },
    tileDataAvatar: {
        width: "140px",
        height: "140px"
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class ListMatches extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.classes = props.classes;
    }

    state = {
        userMatches: []
    }

    componentWillReceiveProps(nextProps) {
        const matches = nextProps.matches;
        Meteor.call('tandemUserMatches/transform', matches, (error, result) => {
            if (error) {
                handleError(error);
            }
            else {
                this.setState(
                    {
                        userMatches: result
                    }
                );
            }
        });
    }

    goToRoom(roomName) {
        return FlowRouter.go('group', {name: roomName}, FlowRouter.current().queryParams);
    }

    getOtherUserUsername(tileData) {
        return tileData.symetricLanguageTeacher._id === Meteor.userId() ?
            tileData.matchingLanguageTeacher.username
            :
            tileData.symetricLanguageTeacher.username;
    }

    getGeneralRender(matches, title) {
        return matches.length !== 0 ?
            (<div className={this.classes.yourStudentsTitle}>
                <Typography variant="overline">{title}</Typography>
                {matches.map((tile, index) => (
                    <div className={this.classes.listOfLanguageFriends}
                         key={tile.matchingLanguage + '_' + tile.symetricLanguage}>
                        <Card className={this.classes.cardAccepted}>
                            {
                                this.getTileData(tile)
                            }
                        </Card>
                    </div>
                ))}
            </div>) : ""
    }

    getTileData(tile) {
        return (<div>
            <div className={this.classes.details}>
                <div className={this.classes.tileDataAvatar}>
                    <Blaze template="avatar"
                           username={this.getOtherUserUsername(tile)}/>
                </div>
                <CardContent className={this.classes.content}>
                    <Typography component="h6" variant="h6">
                        {this.getOtherUserUsername(tile)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t("Languages")} {tile.matchingLanguage} - {tile.symetricLanguage}
                    </Typography>
                    <Button variant="contained" onClick={() => {
                        this.goToRoom(tile.roomName)
                    }} className={this.classes.button}>
                        {t("Go_To_Room")}
                    </Button>
                </CardContent>
            </div>
        </div>)
    }

    render() {
        return (
            <div>
                {this.getGeneralRender(
                    this.state.userMatches.filter(match => match.status === MatchingRequestStateEnum.ACCEPTED),
                    t("My_Students")
                )}
                <Divider/>
                {this.getGeneralRender(
                    this.state.userMatches.filter(match => match.status === MatchingRequestStateEnum.COMPLETED),
                    t("My_Completed")
                )}
                <Divider/>
                {this.getGeneralRender(
                    this.state.userMatches.filter(match => match.status === MatchingRequestStateEnum.PENDING),
                    t("My_Pending")
                )}
                <Divider/>
                {this.getGeneralRender(
                    this.state.userMatches.filter(match => match.status === MatchingRequestStateEnum.DECLINED),
                    t("My_Declined")
                )}
            </div>
        )
    }
}

ListMatches.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListMatches);
