import React from "react";
import {
    MDBContainer, MDBRow, MDBCol, MDBInput, MDBBox,
    MDBCard, MDBCardBody, MDBCardTitle, MDBCardText
} from 'mdbreact';
import Cookies from 'js-cookie'
import $ from 'jquery';

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
                Cookies.set("filter", "Manager")
                // Reload page
                window.location.reload(false);
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
                        if (validUser && validUser !== undefined && Object.keys(validUser).length > 0) {
                            // Display detail based on credential
                            Cookies.set("filter", user)
                            // Reload page
                            window.location.reload(false);
                        } else {
                            alert("Invalid credential. Please try again.")
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
                            notifStr: "Unexpected error, please reload the page!",
                            error: true
                        })
                            
                        console.error('Oh well, you failed. Here some thoughts on the error that occured:', error)
                    }
                )
                .catch(
                    (err) => {
                        this.setState({
                            isLoaded: true,
                            isNotif: true,
                            notifCat: "error",
                            notifStr: "Unexpected error, please reload the page!",
                            error: true
                        })
                            
                        console.error('Oh well, you failed. Here some thoughts on the error that occured:', err)
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
                                    <MDBCardTitle className="font-weight-bold font-family-architects-daughter text-center">Sign in</MDBCardTitle>
                                    <MDBCardText>
                                        <form onSubmit={this.onLoginHandle.bind(this)}>
                                            <MDBBox tag="div" className="grey-text">
                                                <MDBInput label="Type your username or email" name="user" icon="user" group type="text" />
                                            </MDBBox>
                                            <MDBBox tag="div" className="text-center">
                                                <button className="btn btn-default waves-effect waves-light">Login</button>
                                            </MDBBox>
                                        </form>
                                    </MDBCardText>
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