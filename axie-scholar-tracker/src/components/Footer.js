import React from 'react'
import { MDBContainer, MDBFooter, MDBBox } from "mdbreact";

class Footer extends React.Component {
    render() {
        return (
            <MDBFooter color="" className="font-small pt-4 w-100">
                <MDBBox tag="div" className="footer-copyright text-center py-3">
                <MDBContainer fluid>
                    &copy; {new Date().getFullYear()} Copyright: Team Loki x To the Moon ® All Rights Reserved.
                </MDBContainer>
                </MDBBox>
          </MDBFooter>
        )
    }
}

export default Footer