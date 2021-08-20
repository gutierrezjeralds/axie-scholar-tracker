import React from "react";
import $ from 'jquery';
import { 
    MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText,
    MDBTable, MDBTableBody, MDBTableHead
} from "mdbreact";
import Moment from 'react-moment';

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            isNotif: false,
            notifCat: "default",
            notifStr: "",
            slpCurrentValue: 0,
            isRecordLoaded: false,
            recordItems: [],
            isPlayerLoaded: false,
            playerItems: [],
            playerRecords: []
        }
    }

    UNSAFE_componentWillMount() {
        this.pageRefresh();
        this.getCoingecko();
        this.getRecord();
    }

    // Page reload
    pageRefresh = () => {
        setTimeout( function() {
            window.location.reload(false);
        }, 120000);
    }

    // Get Coingecko data / json
    getCoingecko = () => {
        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/smooth-love-potion?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                this.setState({
                    slpCurrentValue: result.market_data.current_price.php
                })

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
                    recordItems: result
                })

                // Fetch player details in api of sky mavis
                this.state.recordItems.map(async (item, index) => {
                    const ethAddress = item.ethAddress ? `0x${item.ethAddress.substring(6)}` : "";
                    await this.getPlayerDetails(item, ethAddress);
                    if (index === this.state.recordItems.length - 1) {
                        this.setState({
                            isLoaded: true,
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
    getPlayerDetails = async (details, ethAddress) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://game-api.skymavis.com/game-api/clients/" + ethAddress + "/items/1",
                dataType: "json",
                cache: false
            })
            .then(
                async (result) => {
                    // Get Player ranking base on Sky Mavis API
                    const ranking = await this.getPlayerRanking(ethAddress);
                    if (!ranking.error) {
                        result.details = details;
                        result.ranking = ranking;
                        this.state.playerItems.push(result);
                        this.setState({
                            playerRecords: this.state.playerItems
                        })

                        return resolve({error: false});
                    } else {
                        return reject({error: true});
                    }
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
                    return reject({error: true});
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
                    return reject({error: true});
                }
            )
        }).catch(err => {
            this.setState({
                isLoaded: true,
                isNotif: true,
                notifCat: "error",
                notifStr: "Unexpected error, please reload the page!",
                error: true
            })
                
            console.error('Oh well, you failed. Here some thoughts on the error that occured:', err)
            return err;
        });
    }

    // Get Player ranking base on Sky Mavis API
    getPlayerRanking = async (ethAddress) => {
        return new Promise((resolve, reject) => {
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
                    return resolve({error: false});
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
                    return reject({error: true})
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
                    return reject({error: true});
                }
            )
        }).catch(err => {
            this.setState({
                isLoaded: true,
                isNotif: true,
                notifCat: "error",
                notifStr: "Unexpected error, please reload the page!",
                error: true
            })
                
            console.error('Oh well, you failed. Here some thoughts on the error that occured:', err)
            return err;
        });
    }

    // Render details for page refresh
    renderPageRefresh() {
        return (
            <React.Fragment>
                <MDBCol size="12" className="">
                    <MDBBox tag="div" className="py-3 text-center pale-turquoise-bg">
                        <MDBBox tag="span" className="blue-whale">
                            Page refresh automatically within 120 seconds.
                        </MDBBox>
                    </MDBBox>
                </MDBCol>
            </React.Fragment>
        )
    }

    // Render Coingecko details
    renderCoingecko() {
        if (this.state.slpCurrentValue > 0) {
            return (
                <React.Fragment>
                    <MDBCol size="12" className="my-3">
                        <MDBBox tag="div" className="py-3 text-center ice-bg">
                            <MDBBox tag="span" className="blue-whale">
                                Prices are based on
                                <a href="https://www.coingecko.com/en/coins/smooth-love-potion" target="_blank" rel="noreferrer"> CoinGecko. </a>
                                Current exchange rate:
                                <strong> 1 SLP = {this.state.slpCurrentValue}</strong>
                            </MDBBox>
                        </MDBBox>
                    </MDBCol>
                </React.Fragment>
            )
        }
    }

    // Render Top scholar x ELO Ranking and SLP Earning
    renderTopScholar() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (Object.keys(this.state.playerRecords).length > 0) {
                return (
                    <React.Fragment>
                        <MDBCol size="12" className="">
                            <MDBBox tag="div" className="py-3 text-center rgba-teal-strong">
                                {
                                    // Top ELO / MMR Rank
                                    this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map((items, index) => (
                                        index === 0 ? (
                                            <MDBBox key={items.client_id} tag="span" className="">Top MMR: <strong>{items.ranking.name} ({items.ranking.elo})</strong></MDBBox>
                                        ) : ("")
                                    ))
                                }

                                {
                                    // Top In Game SLP
                                    this.state.playerRecords.sort((a, b) =>  b.total - a.total ).map((items, index) => (
                                        index === 0 ? (
                                            <MDBBox key={items.client_id} tag="span" className="ml-2">Top In Game SLP: <strong>{items.ranking.name} ({items.total})</strong></MDBBox>
                                        ) : ("")
                                    ))
                                }
                            </MDBBox>
                        </MDBCol>
                    </React.Fragment>
                )
            }
        }
    }

    // Render all players details
    renderAllDetails() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (Object.keys(this.state.playerRecords).length > 0) {
                return (
                    <React.Fragment>
                        {
                            // Manager display x always on top
                            this.state.playerRecords.map(items => (
                                items.details.manager === "100" ? (
                                    <MDBCol key={items.client_id} sm="12" md="6" lg="4" className="my-3">
                                        <MDBCard className="z-depth-2">
                                            <MDBCardBody className="black-text">
                                                <MDBCardTitle className="font-weight-bold font-family-architects-daughter">{items.ranking.name}</MDBCardTitle>
                                                <MDBCardText>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">MMR: </MDBBox>
                                                        {(items.ranking.elo).toLocaleString()}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Rank: </MDBBox>
                                                        {(items.ranking.rank).toLocaleString()}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Last Claimed SLP: </MDBBox>
                                                        {items.blockchain_related.signature.amount > 0 ? (items.blockchain_related.signature.amount) : ("")}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Last Claimed At: </MDBBox>
                                                        {items.blockchain_related.signature.amount > 0 ? (
                                                            <Moment format="MMM DD, YYYY HH:MM A" unix>{items.blockchain_related.signature.timestamp}</Moment>
                                                        ) : ("")}
                                                    </MDBBox>
                                                    <MDBBox tag="div" className="mt-3">
                                                        <MDBTable bordered striped responsive>
                                                            <MDBTableHead color="rgba-teal-strong" textWhite>
                                                                <tr>
                                                                    <th colspan="5" className="text-center font-weight-bold">Smooth Love Potion</th>
                                                                </tr>
                                                            </MDBTableHead>
                                                            <MDBTableBody>
                                                                <tr className="text-center">
                                                                    <td colspan="2" className="font-weight-bold">CLAIM ON</td>
                                                                    <td colspan="3" className="font-weight-bold">{<Moment format="MMM DD, YYYY HH:MM A" add={{ days: 14 }} unix>{items.last_claimed_item_at}</Moment>}</td>
                                                                </tr>
                                                                <tr className="text-center">
                                                                    <td className="font-weight-bold" title="Adventure SLP Quest (Today)">ADV</td>
                                                                    <td className="font-weight-bold" title="In Game SLP">INGAME</td>
                                                                    <td className="font-weight-bold" title="In Game SLP Sharing">SHARE ({items.details.manager}%)</td>
                                                                    <td className="font-weight-bold" title="Ronin SLP + Sharing SLP">TOTAL</td>
                                                                    <td className="font-weight-bold" title="PHP Currency">EARNING</td>
                                                                </tr>
                                                                <tr className="text-center">
                                                                    <td>0</td>
                                                                    <td>{items.total}</td>
                                                                    <td>{Math.floor(items.total * ("0."+items.details.manager))}</td>
                                                                    <td>{Math.floor(items.total * ("0."+items.details.manager))}</td>
                                                                    <td>{(items.total * this.state.slpCurrentValue).toFixed(2)}</td>
                                                                </tr>
                                                            </MDBTableBody>
                                                        </MDBTable>
                                                    </MDBBox>
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    </MDBCol>
                                ) : ("")
                            ))
                        }

                        {
                            // Scholar display x sort by ELO Ranking
                            this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map(items => (
                                items.details.manager !== "100" ? (
                                    <MDBCol key={items.client_id} sm="12" md="6" lg="4" className="my-3">
                                        <MDBCard className="z-depth-2">
                                        <MDBCardBody className="black-text">
                                                <MDBCardTitle className="font-weight-bold font-family-architects-daughter">{items.ranking.name}</MDBCardTitle>
                                                <MDBCardText>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">MMR: </MDBBox>
                                                        {(items.ranking.elo).toLocaleString()}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Rank: </MDBBox>
                                                        {(items.ranking.rank).toLocaleString()}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Last Claimed SLP: </MDBBox>
                                                        {items.blockchain_related.signature.amount > 0 ? (items.blockchain_related.signature.amount) : ("")}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="text-left black-text w-100 position-relative d-block">
                                                        <MDBBox tag="span" className="font-weight-bold">Last Claimed At: </MDBBox>
                                                        {items.blockchain_related.signature.amount > 0 ? (
                                                            <Moment format="MMM DD, YYYY HH:MM A" unix>{items.blockchain_related.signature.timestamp}</Moment>
                                                        ) : ("")}
                                                    </MDBBox>
                                                    <MDBBox tag="div" className="mt-3">
                                                        <MDBTable bordered striped responsive>
                                                            <MDBTableHead color="rgba-teal-strong" textWhite>
                                                                <tr>
                                                                    <th colspan="5" className="text-center font-weight-bold">Smooth Love Potion</th>
                                                                </tr>
                                                            </MDBTableHead>
                                                            <MDBTableBody>
                                                                <tr className="text-center">
                                                                    <td colspan="2" className="font-weight-bold">CLAIM ON</td>
                                                                    <td colspan="3" className="font-weight-bold">{<Moment format="MMM DD, YYYY HH:MM A" add={{ days: 14 }} unix>{items.last_claimed_item_at}</Moment>}</td>
                                                                </tr>
                                                                <tr className="text-center">
                                                                    <td className="font-weight-bold" title="Adventure SLP Quest (Today)">ADV</td>
                                                                    <td className="font-weight-bold" title="In Game SLP">INGAME</td>
                                                                    <td className="font-weight-bold" title="In Game SLP Sharing">SHARE ({items.details.scholar}%)</td>
                                                                    <td className="font-weight-bold" title="Ronin SLP + Sharing SLP">TOTAL</td>
                                                                    <td className="font-weight-bold" title="PHP Currency">EARNING</td>
                                                                </tr>
                                                                <tr className="text-center">
                                                                    <td>0</td>
                                                                    <td>{items.total}</td>
                                                                    <td>{Math.floor(items.total * ("0."+items.details.scholar))}</td>
                                                                    <td>{Math.floor(items.total * ("0."+items.details.scholar))}</td>
                                                                    <td>{(items.total * this.state.slpCurrentValue).toFixed(2)}</td>
                                                                </tr>
                                                            </MDBTableBody>
                                                        </MDBTable>
                                                    </MDBBox>
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    </MDBCol>
                                ) : ("")
                            ))
                        }
                    </React.Fragment>
                )
            }
        }
    }

    render() {
        document.title = "Home | Axie Scholar Tracker";
        return (
            <MDBBox tag="div" className="home-wrapper">
                {
                    !this.state.isLoaded ? (
                        // Loading
                    <MDBBox tag="div" className="loader-section">
                        <MDBBox tag="div" className="position-fixed z-index-9999 l-0 t-0 r-0 b-0 m-auto overflow-visible flex-center">
                            <MDBBox tag="span" className="loader-spin-dual-ring"></MDBBox>
                            <MDBBox tag="span" className="ml-2 font-size-1rem white-text">Loading, please wait...</MDBBox>
                        </MDBBox>
                        <MDBBox tag="div" className="loader-backdrop position-fixed z-index-1040 l-0 t-0 r-0 b-0 black"></MDBBox>
                    </MDBBox>
                    ) : ("")
                }

                {/* Render Notification Bar for Page refresh, Coingecko details and Top Scholar */}
                <MDBContainer fluid className="pt-5 mt-5 position-relative">
                    <MDBRow>
                        {this.renderPageRefresh()}
                        {this.renderCoingecko()}
                        {this.renderTopScholar()}
                    </MDBRow>
                </MDBContainer>

                {
                    Object.keys(this.state.playerRecords).length <= 0 ? (
                        // Empty Player details
                        <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative">
                            <MDBRow>
                                No Details found.
                            </MDBRow>
                        </MDBContainer>
                    ) : (
                        // Diplay Player details
                        <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative">
                            <MDBRow>
                                {this.renderAllDetails()}
                            </MDBRow>
                        </MDBContainer>
                    )
                }
            </MDBBox>
        )
    }
}

export default Home