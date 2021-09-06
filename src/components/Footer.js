import React from 'react'
import { MDBContainer, MDBFooter, MDBBox } from "mdbreact";
import { CONSTANTS } from './Constants';

class Footer extends React.Component {
    render() {
        return (
            <MDBFooter color="" className="font-small w-100">
                <MDBBox tag="div" className="text-center py-2">
                    {CONSTANTS.MESSAGE.PAGE_REFRESH} {CONSTANTS.MESSAGE.NOTIFBAR_CLICKABLE}
                </MDBBox>
                <MDBBox tag="div" className="footer-copyright text-center py-3">
                    <MDBContainer fluid>
                        &copy; {new Date().getFullYear()} {CONSTANTS.MESSAGE.FOOTERTITLE}
                    </MDBContainer>
                </MDBBox>
          </MDBFooter>
        )
    }
}

export default Footer