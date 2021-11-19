import React from "react";
import $ from 'jquery';
import { CONSTANTS } from '../Constants';
import {
    MDBContainer, MDBRow, MDBCol, MDBInput, MDBBox,
    MDBCard, MDBCardBody, MDBCardTitle
} from 'mdbreact';
import Cookies from 'js-cookie'

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            isNotif: false,
            notifCat: "default",
            notifStr: "",
            isValidUser: 0,
            errorMsg: CONSTANTS.MESSAGE.UNEXPECTED_ERROR
        }
    }

    onLoginHandle(event) {
        event.preventDefault();
        const user = event.target.user.value;
        if (user && user !== undefined) {
            if (user === "TeamLoki2021") {
                // Display all details
                Cookies.set("filter", CONSTANTS.MESSAGE.MANAGER)
                // Reload page
                window.location.reload();
            } else {
                // Get Record Data from table / json
                $.ajax({
                    url: "/api/userProfile",
                    type: "GET",
                    contentType: 'application/json',
                    cache: false,
                })
                .then(
                    (result) => {
                        const dataRecords = result.data;
                        const validUser = dataRecords.find(valid => valid.EMAIL.toLowerCase() === user.toLowerCase() || valid.NAME.toLowerCase() === user.toLocaleLowerCase());
                        const validSponsor = dataRecords.find(valid => valid.SPONSOR_NAME.toLowerCase() === user.toLowerCase());
                        if (validUser && validUser !== undefined && Object.keys(validUser).length > 0) {
                            // Display detail based on credential
                            Cookies.set("filter", user)
                            // Reload page
                            window.location.reload();
                        } else {
                            if (validSponsor && validSponsor !== undefined && Object.keys(validSponsor).length > 0) {
                                // Display detail based on credential
                                Cookies.set("filter", user)
                                // Reload page
                                window.location.reload();
                            } else {
                                this.setState({
                                    isValidUser: false,
                                    errorMsg: CONSTANTS.MESSAGE.INVALID_CREDENTIAL
                                })
                            }
                        }
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        this.setState({
                            isLoaded: true,
                            isNotif: true,
                            notifCat: "error",
                            notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                            error: true,
                            isValidUser: false,
                            errorMsg: CONSTANTS.MESSAGE.UNEXPECTED_ERROR
                        })
                            
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    }
                )
                .catch(
                    (err) => {
                        this.setState({
                            isLoaded: true,
                            isNotif: true,
                            notifCat: "error",
                            notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                            error: true,
                            isValidUser: false,
                            errorMsg: CONSTANTS.MESSAGE.UNEXPECTED_ERROR
                        })
                            
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    }
                )
            }
        }
    }

    // On Change Input
    onInputChangeHandle(event) {
        event.preventDefault();
        this.setState({
            isValidUser: 0
        })
    }

    render() {
        return (
            <React.Fragment>
                <MDBContainer className="h-50vh">
                    <MDBRow className="h-50vh justify-content-center align-self-center">
                        <MDBCol sm="12" md="6" lg="6" className="justify-content-center align-self-center">
                            <MDBCard className="z-depth-2 w-100">
                                <MDBCardBody className="black-text">
                                    <MDBCardTitle className="font-weight-bold font-family-architects-daughter text-center">{CONSTANTS.MESSAGE.SIGNIN}</MDBCardTitle>
                                    <MDBBox tag="div">
                                        <form onSubmit={this.onLoginHandle.bind(this)}>
                                            <MDBBox tag="div" className="grey-text">
                                                <MDBInput
                                                    onChange={this.onInputChangeHandle.bind(this)}
                                                    label={CONSTANTS.MESSAGE.INPUT_USER}
                                                    name="user"
                                                    icon="user"
                                                    group type="text"
                                                    className={this.state.isValidUser === 0 ? "" : this.state.isValidUser ? "form-control is-valid" : "form-control is-invalid"}
                                                />
                                                <MDBBox tag="div" className={this.state.isValidUser === 0 ? "d-none" : this.state.isValidUser ? "d-none" : "invalid-feedback mt-1rem-neg mb-2 d-block"}>{this.state.errorMsg}</MDBBox>
                                            </MDBBox>
                                            <MDBBox tag="div" className="text-center">
                                                <button className="btn btn-default waves-effect waves-light">{CONSTANTS.MESSAGE.LOGIN}</button>
                                            </MDBBox>
                                        </form>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            </React.Fragment>
        )
    }
}

export default Login