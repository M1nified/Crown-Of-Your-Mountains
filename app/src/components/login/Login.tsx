import { Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import React, { Component } from "react";
import { Button } from "react-bootstrap";
import firebase from './../../firebase';
import './Login.scss';


type LoginState = {
    open: boolean,
    provider?: firebase.auth.AuthProvider,
}

type LoginProps = {
    open: boolean,
}

export default class Login extends Component<LoginProps, LoginState> {

    state: LoginState = {
        open: true,
    }

    componentDidUpdate(prevProps: LoginProps) {
        if (prevProps.open !== this.props.open) {
            this.setState({
                open: this.props.open,
            })
        }
    }

    render() {
        return (
            <Dialog open={this.state.open} onClose={this.handleDialogClose}>
                <DialogTitle>
                    Please login to continue
                    </DialogTitle>
                <DialogContent>
                    <Button onClick={this.handleLoginWithGoogle}>Google</Button>
                </DialogContent>
                <DialogActions>

                </DialogActions>
            </Dialog>
        )
    }

    handleDialogClose = () => {
        // this.setState({ open: false });
    }

    handleLoginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        this.setState({
            provider
        }, () => {
            this.login();
        })
    }

    login = async () => {
        if (!this.state.provider)
            return;
        try {
            const result = await firebase.auth().signInWithPopup(this.state.provider);
            if (!result.credential)
                return;
            // const token = result.credential.
            const user = result.user;
        } catch (error) {
            console.error(error);
        }

    }

}