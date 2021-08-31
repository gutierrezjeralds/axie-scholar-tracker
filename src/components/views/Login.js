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
            notifStr: ""
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
                    url: "../assets/json/eth-address.json",
                    dataType: "json",
                    cache: false
                })
                .then(
                    (result) => {
                        const validUser = result.find(valid => valid.email.toLowerCase() === user.toLowerCase() || valid.name.toLowerCase() === user.toLocaleLowerCase());
                        const validSponsor = result.find(valid => valid.sponsorName.toLowerCase() === user.toLowerCase());
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
                                alert(CONSTANTS.MESSAGE.INVALID_CREDENTIAL)
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
                            error: true
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
                            error: true
                        })
                            
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    }
                )
            }
        }
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
                                                <MDBInput label={CONSTANTS.MESSAGE.INPUT_USER} name="user" icon="user" group type="text" />
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