import React from 'react'
import { MDBContainer, MDBFooter, MDBBox } from "mdbreact";
import { MESSAGE } from './Constants';

class Footer extends React.Component {
    render() {
        return (
            <MDBFooter color="" className="font-small w-100">
                <MDBBox tag="div" className="text-center py-2">
                    {/* <MDBBox tag="span" className="d-block d-md-inline d-lg-inline">{MESSAGE.PAGE_REFRESH} </MDBBox>
                    <MDBBox tag="span">{MESSAGE.NOTIFBAR_CLICKABLE}</MDBBox> */}
                </MDBBox>
                <MDBBox tag="div" className="footer-copyright text-center py-3">
                    <MDBContainer fluid>
                        &copy; {new Date().getFullYear()} {MESSAGE.FOOTERTITLE}
                    </MDBContainer>
                </MDBBox>
          </MDBFooter>
        )
    }
}

export default Footer