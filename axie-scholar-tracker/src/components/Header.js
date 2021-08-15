import React from 'react'
import {
    MDBBox, MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavbarToggler, MDBCollapse, MDBContainer
} from "mdbreact";

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        };
    }
    
    toggleCollapse = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    render() {
        return (
            <MDBBox tag="header">
                <MDBNavbar scrolling fixed="top" dark expand="lg">
                    <MDBContainer>
                        <MDBNavbarBrand>
                            <a href="/">
                                <MDBBox tag="p" className="white-text d-dlock m-0 text-center font-size-1pt5rem z-depth-0 rounded-circle">Team Loki</MDBBox>
                            </a>
                        </MDBNavbarBrand>
                        <MDBNavbarToggler onClick={this.toggleCollapse} />
                        <MDBCollapse id="navbarCollapse3" isOpen={this.state.isOpen} navbar>
                            <MDBNavbarNav right>
                                <MDBNavItem active>
                                    <MDBBox tag="span" className="white-text cursor-pointer">Add New Scholar</MDBBox>
                                </MDBNavItem>
                            </MDBNavbarNav>
                        </MDBCollapse>
                    </MDBContainer>
                </MDBNavbar>
            </MDBBox>
        )
    }
}

export default Header