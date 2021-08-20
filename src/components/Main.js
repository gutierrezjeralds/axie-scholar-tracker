import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Home from './views/Home'
import { MDBBox } from 'mdbreact'

class Main extends React.Component {
    render() {
        return (
            <React.Fragment>
                <MDBBox tag="div" className="axie-sholar-tracker-app icy-blues-grays-palette very-light-gray-bg h-100">
                    <Header />
                    <MDBBox tag="div" className="main">
                        <Home />
                    </MDBBox>
                    <Footer />
                </MDBBox>
            </React.Fragment>
        )
    }
}

export default Main