import React from 'react';
import { MDBContainer, MDBBtn, MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';

class Manager extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modal: false
        };
    }

    
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    render() {
        return (
        <MDBContainer>
            <MDBModal isOpen={this.state.modal} toggle={this.toggle}>
            <MDBModalHeader toggle={this.toggle}>MDBModal title</MDBModalHeader>
            <MDBModalBody>
                (...)
            </MDBModalBody>
            <MDBModalFooter>
                <MDBBtn color="secondary" onClick={this.toggle}>Close</MDBBtn>
                <MDBBtn color="primary">Save changes</MDBBtn>
            </MDBModalFooter>
            </MDBModal>
        </MDBContainer>
        );
    }
}

export default Manager