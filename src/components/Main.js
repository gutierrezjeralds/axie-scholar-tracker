import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Home from './views/Home'
import Cookies from 'js-cookie'
import { MDBBox } from 'mdbreact'
import $ from 'jquery';

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            isNotif: false,
            notifCat: "default",
            notifStr: "",
            recordItem: [],
            promptUser: null
        }
    }

    UNSAFE_componentWillMount() {
        this.pageRefresh();
        this.getRecord()
    }

    // Page reload
    pageRefresh = () => {
        setTimeout( function() {
            window.location.reload(false);
        }, 120000);
    }

    // Get Record Data from table / json
    getRecord = () => {
        $.ajax({
            url: "../assets/json/eth-address.json",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                this.inputPrompt(result);
                this.setState({
                    isLoaded: true,
                    recordItem: result
                })
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

    // Display prompt for checking the data/display of player/scholar
    inputPrompt = (item) => {
        const filter = Cookies.get("filter");
        if (filter !== undefined && filter !== "") {
            // Get existing filter
            this.setState({
                promptUser : filter
            })
        } else {
            // Set new filter
            const enteredUser = prompt('Please enter your name or email');
            if (enteredUser) {
                if (enteredUser.toLowerCase() === "manager") {
                    const enteredCredential = prompt('Please enter credential');
                    if (enteredCredential && enteredCredential === "TeamLoki2021") {
                        Cookies.set("filter", "All")
                        this.setState({
                            promptUser : "All"
                        })
                    }
                } else {
                    const validUser = item.find(valid => valid.email.toLowerCase() === enteredUser.toLowerCase() || valid.name.toLowerCase() === enteredUser.toLocaleLowerCase());
                    if (Object.keys(validUser).length > 0) {
                        Cookies.set("filter", enteredUser)
                        this.setState({
                            promptUser : enteredUser
                        })
                    } else {
                        this.inputPrompt()
                    }
                }
            } else {
                this.inputPrompt()
            }
        }
    }

    renderBody() {
        if ( this.state.promptUser !== null && this.state.isLoaded && !this.state.error ) {
            return (
                <React.Fragment>
                    <Header />
                    <MDBBox tag="div" className="main">
                        <Home user={this.state.promptUser} record={this.state.recordItem} />
                    </MDBBox>
                    <Footer />
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