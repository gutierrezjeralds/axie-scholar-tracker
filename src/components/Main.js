import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Home from './views/Home'
import Login from './views/Login'
import Cookies from 'js-cookie'
import { MDBBox } from 'mdbreact'

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
                <MDBBox tag="div" className="axie-sholar-tracker-app icy-blues-grays-palette very-light-gray-bg h-100">
                    {this.renderBody()}
                </MDBBox>
            </React.Fragment>
        )
    }
}

export default Main