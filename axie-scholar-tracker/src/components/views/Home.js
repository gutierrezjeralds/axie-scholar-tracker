import React from "react";
import $ from 'jquery'
import { MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText } from "mdbreact";
// import { Fade } from 'react-reveal';

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            isNotif: false,
            notifCat: "default",
            notifStr: "",
            isRecordLoaded: false,
            recordItems: [],
            isPlayerLoaded: false,
            playerItems: [],
            playerRecords: []
        }
    }

    UNSAFE_componentWillMount() {
        this.getRecord();
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
                this.setState({
                    isLoaded: true,
                    recordItems: result
                })

                // Fetch player details in api of sky mavis
                this.state.recordItems.map((item, index) => {
                    const ethAddress = item.ethAddress ? `0x${item.ethAddress.substring(6)}` : "";
                    this.getPlayerDetails(ethAddress);
                    if (index === this.state.recordItems.length - 1) {
                        this.setState({
                            isPlayerLoaded: true
                        })
                    }
                    return true;
                });
                console.log(this.state.playerItems)
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

    // Get Player details base on Sky Mavis API
    getPlayerDetails = (ethAddress) => {
        $.ajax({
            url: "https://game-api.skymavis.com/game-api/clients/" + ethAddress + "/items/1",
            dataType: "json",
            cache: false
        })
        .then(
            async (result) => {
                // Get Player ranking base on Sky Mavis API
                const ranking = await this.getPlayerRanking(ethAddress);
                result.ranking = ranking;
                console.log(result)
                this.state.playerItems.push(result);
                this.setState({
                    playerRecords: this.state.playerItems
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

    // Get Player ranking base on Sky Mavis API
    getPlayerRanking = async (ethAddress) => {
        return new Promise((resolve) => {
            $.ajax({
                url: "https://game-api.skymavis.com/game-api/leaderboard?client_id=" + ethAddress,
                dataType: "json",
                cache: false
            })
            .then(
                (result) => {
                    if (result.success && result.items.length > 0) {
                        const player = result.items.find(client => client.client_id === ethAddress);
                        if (Object.keys(player).length > 0) {
                            return resolve(player);
                        }
                    }
                    return resolve();
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
        });
    }

    render() {
        document.title = "Home | Axie Scholar Tracker";
        return (
            <MDBBox tag="div" className="home-wrapper">
                <MDBContainer fluid className="py-5 position-relative">
                    <MDBRow>
                        {
                            this.state.playerRecords.map(items => (
                                // <Fade key={items.client_id}>
                                    <MDBCol size="3">
                                        <MDBCard className="z-depth-2">
                                            <MDBCardBody className="mdb-color lighten-3 white-text">
                                                <MDBCardTitle>{items.ranking.name}</MDBCardTitle>
                                                <MDBCardText>
                                                    <MDBBox tag="span" className="text-left white-text w-100">In game SLP: {items.total}</MDBBox>
                                                    <MDBBox tag="p" className="text-left white-text">Claim on: 0</MDBBox>
                                                    <MDBBox tag="p" className="text-left white-text">Elo: {items.ranking.elo}</MDBBox>
                                                    <MDBBox tag="p" className="text-left white-text">Rank: {items.ranking.rank}</MDBBox>
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    </MDBCol>
                                // </Fade>
                            ))
                        }
                    </MDBRow>
                </MDBContainer>
            </MDBBox>
        )
    }
}

export default Home