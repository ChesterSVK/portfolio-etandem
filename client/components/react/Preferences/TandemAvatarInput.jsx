import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { t } from 'meteor/rocketchat:utils';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = theme => ({
    input: {
        display: 'none',
    },
    button: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    buttonParent: {
        padding: "4em 0",
        textAlign: "center"
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Class

class AvatarInput extends React.Component {
    state = {
        file: ''
    }

    handleChange = (event) => {
        const url = URL.createObjectURL(event.target.files[0]);
        this.setState({
            file: url
        });

        this.props.onChange(url);
    }

    render() {
        const {classes} = this.props;
        return (
            <div>
                <Typography className={classes.buttonParent} variant="h4">
                    <Link className={classes.button}
                          color="primary"
                          size="big"
                          href="/account/profile">
                        {t("preferences_user")}
                    </Link>
                </Typography>
            </div>
        );
    }
}

AvatarInput.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AvatarInput);
