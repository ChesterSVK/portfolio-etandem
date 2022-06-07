import { t } from 'meteor/rocketchat:utils';
import { preferenceScreenType, preferenceStepType } from './TandemPreferences';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import React, { Component } from 'react'
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = {
    button: {
        width: 100,
        float: 'right',
        margin: 8,
    },
    text: {
        float: 'left',
        margin: 8
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class PreferenceActionButtons extends Component {

    render() {
        const { classes } = this.props;

        let page = null;

        let backBtn = null;
        if (this.props.type === preferenceScreenType.firstTime) {
            let stepString = "1/3";
            if (this.props.step === preferenceStepType.study) {
                stepString = "2/3";
                backBtn = (<Button type="submit"
                    fullWidth
                    variant="text"
                    color="secondary"
                    className={classes.button}
                    onClick={this.props.handleBack}
                >{t("Back")}
                </Button>);
            }
            if (this.props.step === preferenceStepType.avatar) {
                stepString = "3/3";
                backBtn = (<Button type="submit"
                    fullWidth
                    variant="text"
                    color="secondary"
                    className={classes.button}
                    onClick={this.props.handleBack}
                >{t("Back")}
                </Button>);
            }

            page = (<div>
                <Typography className={classes.text} variant="h6">
                    {stepString}
                </Typography>

                <Button type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={this.props.handleNext}
                >{t("Next")}
                </Button>

                {backBtn}
            </div>);
        }
        else
            if (this.props.type === preferenceScreenType.setting) {
                page = (<div>
                    <Button type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={this.props.handleSave}
                    >{t("Save")}
                    </Button>
                </div>);
            }

        return page;
    }
}

export default withStyles(styles)(PreferenceActionButtons);
