import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Classic from './views/classic/Home' // Home page for Classic details
import Origin from './views/origin/Home' // Home page for Origin details
import Login from './views/Login'
import Cookies from 'js-cookie'
import { MDBBox } from 'mdbreact'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
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
                    <Router>
                        <Header user={this.state.promptUser} />
                        <MDBBox tag="div" className="main">
                            <Switch >
                                <Route exact path="/">
                                    <Origin user={this.state.promptUser} />
                                </Route>
                                <Route exact path="/classic">
                                    <Classic user={this.state.promptUser} />
                                </Route>
                            </Switch>
                        </MDBBox>
                        <Footer />
                    </Router>
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