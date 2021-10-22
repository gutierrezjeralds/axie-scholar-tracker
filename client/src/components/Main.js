import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Home from './views/Home'
import Login from './views/Login'
import Cookies from 'js-cookie'
import { MDBBox } from 'mdbreact'
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            promptUser: Cookies.get("filter")
        }
    }

    renderBody() {
        if ( this.state.promptUser !== null && this.state.promptUser !== undefined && this.state.promptUser !== "" ) {
            return (
                <React.Fragment>
                    <Header user={this.state.promptUser} />
                    <MDBBox tag="div" className="main">
                        <Home user={this.state.promptUser} />
                    </MDBBox>
                    <Footer />
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <Login />
                </React.Fragment>
            )
        }
    }

    render() {
        return (
            <React.Fragment>
                <MDBBox tag="div">
                    {this.renderBody()}
                </MDBBox>
            </React.Fragment>
        )
    }
}

export default Main