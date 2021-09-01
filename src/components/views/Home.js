import React from "react";
import $ from 'jquery';
import { CONSTANTS } from '../Constants';
import { 
    MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle,
    MDBTable, MDBTableBody, MDBTableHead,
    MDBModal, MDBModalHeader, MDBModalBody,
    MDBIcon
} from "mdbreact";
import Moment from 'react-moment';
import moment from 'moment';

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            isNotif: false,
            notifCat: "default",
            notifStr: "",
            isUser: this.props.user || "",
            isSponsorName: "",
            slpCurrentValue: 0,
            axsCurrentValue: 0,
            isRecordLoaded: false,
            isPlayerLoaded: false,
            playerItems: [],
            playerRecords: [],
            specifPlayerItems: [], // Specific user input
            specifPlayerRecords: [], // Specific user input
            totalManagerSLP: 0,
            totalSponsorSLP: 0,
            isModalEarningOpen: false,
            modalEarningTitle: "",
            modalEarningFilter: "",
            modalEarningDetails: [],
            topUserMMR: "",
            topUserSLP: ""
        }
    }

    UNSAFE_componentWillMount() {
        this.pageRefresh();
        this.getCoingecko();
        this.getRecord();
    }

    // Adding comma in number x replacement in toLocaleString()
    numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Modal Toggle for view of Manager and Sponsor's Earning
    modalEarningToggle = (title, filters, playerDetails) => () => {
        this.setState({
            isModalEarningOpen: !this.state.isModalEarningOpen,
            modalEarningTitle: title,
            modalEarningFilter: filters,
            modalEarningDetails: playerDetails
        });
    }

    // Page reload
    pageRefresh = () => {
        setTimeout( function() {
            window.location.reload();
        }, 120000);
    }

    // Get Coingecko data / json
    getCoingecko = () => {
        // Get Current SLP Value
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
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
                    isLoaded: true,
                    isNotif: true,
                    notifCat: "error",
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                this.setState({
                    isLoaded: true,
                    isNotif: true,
                    notifCat: "error",
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )

        // Get Current AXS Value
        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/axie-infinity?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                this.setState({
                    axsCurrentValue: result.market_data.current_price.php
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
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                this.setState({
                    isLoaded: true,
                    isNotif: true,
                    notifCat: "error",
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )
    }

    // Fetch Player Record Data
    getRecord = () => {
        $.ajax({
            url: "../assets/json/eth-address.json",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                // Fetch player details in api of sky mavis
                result.map(async (item, index) => {
                    const ethAddress = item.ethAddress ? `0x${item.ethAddress.substring(6)}` : "";
                    var userEthAddress = null;

                    if (item.email.toLowerCase() === this.state.isUser.toLowerCase() ||
                        item.name.toLowerCase() === this.state.isUser.toLowerCase() ||
                        item.sponsorName.toLowerCase() === this.state.isUser.toLowerCase()) {
                            // Get ETH Address based on Credential
                            userEthAddress = ethAddress;
                            if (item.sponsor !== "" || item.sponsor !== undefined) {
                                // Set valid Sponsor Name
                                this.setState({
                                    isSponsorName: this.state.isUser
                                })
                            }
                    }

                    await this.getPlayerDetails(item, ethAddress, userEthAddress);
                    
                    if (index === result.length - 1) {
                        // Get Top User MMR and SLP
                        if (Object.keys(this.state.playerItems).length > 0) {
                            const getTopUserMMR = this.state.playerItems.reduce((max, obj) => (obj.ranking.elo > max.ranking.elo) ? obj : max);
                            const getTopUserSLP = this.state.playerItems.reduce((max, obj) => (obj.inGameSLP > max.inGameSLP) ? obj : max);
                            this.setState({
                                topUserMMR: getTopUserMMR,
                                topUserSLP: getTopUserSLP
                            })
                        }
                        
                        this.setState({
                            isLoaded: true,
                            isPlayerLoaded: true
                        })

                        console.log("playerItems", this.state.playerItems)
                    }
                    return true;
                });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
                    isLoaded: true,
                    isNotif: true,
                    notifCat: "error",
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                this.setState({
                    isLoaded: true,
                    isNotif: true,
                    notifCat: "error",
                    notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )
    }

    // Get Player details base on Sky Mavis API
    getPlayerDetails = async (details, ethAddress, userEthAddress) => {
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
                        result.last_claimed_item_at_add = moment.unix(result.last_claimed_item_at).add(1, 'days');
                        result.details = details;
                        result.ranking = ranking;
                        result.inGameSLP = result.total;
                        result.totalSLP = result.total;

                        if (result.blockchain_related === null || result.blockchain_related.signature === null) {
                            // Adding empty object
                            result.blockchain_related.signature = {
                                amount: 0,
                                timestamp: ""
                            }
                        }

                        result.sharedSLP = result.inGameSLP;
                        if (Object.keys(details).length > 0) {
                            let roninBalance = 0;
                            let totalSLP = 0

                            // Check if has balance in Ronin x Set new value for total in game slp
                            if (result.blockchain_related.balance !== null && result.blockchain_related.balance > 0) {
                                roninBalance = result.blockchain_related.balance;
                                totalSLP = result.total;
                                result.inGameSLP = totalSLP - roninBalance;
                            }

                            if (details.manager === "100" || details.manager > 0) { // Condition for Manager
                                // Set new Shared SLP
                                const managerShare = details.manager === "100" ? 1 : "0." + details.manager;
                                result.sharedManagerSLP = Math.floor(result.inGameSLP * managerShare);

                                // Set new Total Manager's Earning
                                this.setState({
                                    totalManagerSLP: this.state.totalManagerSLP + result.sharedManagerSLP
                                })
                            }

                            if (details.sponsor !== "0" || details.sponsor > 0) { // Condition for Sponsor
                                // Set new Shared SLP
                                const sponsorShare = "0." + details.sponsor;
                                result.sharedSponsorSLP = Math.floor(result.inGameSLP * sponsorShare);

                                // Set new Total Sponsor's Earning
                                this.setState({
                                    totalSponsorSLP: this.state.totalSponsorSLP + result.sharedSponsorSLP
                                })
                            }

                            if (details.scholar !== "0" || details.scholar > 0) { // Condition for Scholar Players
                                // Set new Shared SLP
                                const iskoShare = "0." + details.scholar;
                                result.sharedSLP = Math.floor(result.inGameSLP * iskoShare);
                            }

                            // Set new total SLP x computed base on Shared SLP plus total SLP
                            result.totalSLP = roninBalance + result.sharedSLP;
                        }

                        this.state.playerItems.push(result);
                        this.setState({
                            playerRecords: this.state.playerItems
                        })

                        if (ethAddress === userEthAddress) {
                            // Get ETH Address based on Credential
                            this.state.specifPlayerItems.push(result);
                            this.setState({
                                specifPlayerRecords: this.state.specifPlayerItems
                            })
                        }

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
                        notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                        error: true
                    })
                        
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true});
                }
            )
            .catch(
                (err) => {
                    this.setState({
                        isLoaded: true,
                        isNotif: true,
                        notifCat: "error",
                        notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                        error: true
                    })
                        
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true});
                }
            )
        }).catch(err => {
            this.setState({
                isLoaded: true,
                isNotif: true,
                notifCat: "error",
                notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                error: true
            })
                
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
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
                        notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                        error: true
                    })
                        
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true})
                }
            )
            .catch(
                (err) => {
                    this.setState({
                        isLoaded: true,
                        isNotif: true,
                        notifCat: "error",
                        notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                        error: true
                    })
                        
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true});
                }
            )
        }).catch(err => {
            this.setState({
                isLoaded: true,
                isNotif: true,
                notifCat: "error",
                notifStr: CONSTANTS.MESSAGE.UNEXPECTED_ERROR,
                error: true
            })
                
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    onManagerEarningHandle = () => {
        
    }

    // Render Coingecko details
    renderCoingecko() {
        if (this.state.slpCurrentValue > 0) {
            return (
                <React.Fragment>
                    <MDBCol size="12" className="mb-3">
                        <MDBBox tag="div" className="py-3 px-2 text-center pale-turquoise-bg">
                            <MDBBox tag="span" className="blue-whale">
                                {CONSTANTS.MESSAGE.PRICE_BASEON}
                                <a href="https://www.coingecko.com/en/coins/smooth-love-potion" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.COINGECKO}. </a>
                                {CONSTANTS.MESSAGE.CURRENT_EXCHANGERATE}:
                                <MDBBox tag="span" className="">
                                    <strong> 1 {CONSTANTS.MESSAGE.SLP} = {this.state.slpCurrentValue}</strong>
                                    <strong> and 1 {CONSTANTS.MESSAGE.AXS} = {this.state.axsCurrentValue}</strong>
                                </MDBBox>
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
            if (Object.keys(this.state.playerRecords).length > 0 && (this.state.topUserMMR !== "" && this.state.topUserSLP !== "")) {
                return (
                    <React.Fragment>
                        <MDBCol size="12" className="mb-3">
                            <MDBBox tag="div" className="py-3 px-2 text-center ice-bg">
                                {
                                    // Top ELO / MMR Rank
                                    this.state.topUserMMR !== "" && Object.keys(this.state.topUserMMR).length > 0 ? (
                                        <React.Fragment>
                                            <MDBBox key={this.state.topUserMMR.client_id} tag="span" className="">{CONSTANTS.MESSAGE.TOP_MMR}: <strong>{this.state.topUserMMR.ranking.name} ({this.state.topUserMMR.ranking.elo})</strong></MDBBox>
                                        </React.Fragment>
                                    ) : ("")
                                }

                                {
                                    // Top In Game SLP
                                    this.state.topUserSLP !== "" && Object.keys(this.state.topUserSLP).length > 0 ? (
                                        <React.Fragment>
                                            <MDBBox key={this.state.topUserSLP.client_id} tag="span" className="ml-2">{CONSTANTS.MESSAGE.TOP_INGAME_SLP}: <strong>{this.state.topUserSLP.ranking.name} ({this.state.topUserSLP.inGameSLP})</strong></MDBBox>
                                        </React.Fragment>
                                    ) : ("")
                                }
                            </MDBBox>
                        </MDBCol>
                    </React.Fragment>
                )
            }
        }
    }

    // Render Total Earnings of Manager and Sponsor
    renderEarnings() {
        if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
            if (this.state.totalManagerSLP > 0 || this.state.totalSponsorSLP > 0) {
                // Display Manager and Sponsor's Earning
                return (
                    <React.Fragment>
                        <MDBCol size="12" className="">
                            <MDBBox tag="div" className="py-3 px-2 text-center rgba-teal-strong">
                                {
                                    // Display Manager's Earing
                                    this.state.totalManagerSLP > 0 ? (
                                        <MDBBox tag="span" className="blue-whale d-block cursor-pointer" onClick={this.modalEarningToggle(CONSTANTS.MESSAGE.VIEW_MANAGER_EARNING, CONSTANTS.MESSAGE.MANAGER, this.state.playerRecords)}>
                                            {CONSTANTS.MESSAGE.MANAGER_EARNING}: {CONSTANTS.MESSAGE.SLP} {this.state.totalManagerSLP} (&#8369; {this.numberWithCommas((this.state.totalManagerSLP * this.state.slpCurrentValue).toFixed(2))})
                                        </MDBBox>
                                    ) : ("")
                                }
    
                                {
                                    // Display Sponsor's Earing
                                    this.state.totalSponsorSLP > 0 ? (
                                        <MDBBox tag="span" className="blue-whale d-block">
                                            {CONSTANTS.MESSAGE.SPONSOR_EARNING}: {CONSTANTS.MESSAGE.SLP} {this.state.totalSponsorSLP} (&#8369; {this.numberWithCommas((this.state.totalSponsorSLP * this.state.slpCurrentValue).toFixed(2))})
                                        </MDBBox>
                                    ) : ("")
                                }
                            </MDBBox>
                        </MDBCol>
                    </React.Fragment>
                )
            }
        }

        if (this.state.isUser === this.state.isSponsorName) {
            if (this.state.totalSponsorSLP > 0) {
                // Display Sponsor's Earning
                return (
                    <React.Fragment>
                        <MDBCol size="12" className="">
                            <MDBBox tag="div" className="py-3 px-2 text-center rgba-teal-strong">
                                {
                                    // Display Sponsor's Earing
                                    this.state.totalSponsorSLP > 0 ? (
                                        <MDBBox tag="span" className="blue-whale d-block cursor-pointer" onClick={this.modalEarningToggle(CONSTANTS.MESSAGE.VIEW_SPONSOR_EARNING, CONSTANTS.MESSAGE.SPONSOR, this.state.specifPlayerRecords)}>
                                            {CONSTANTS.MESSAGE.SPONSOR_EARNING}: {CONSTANTS.MESSAGE.SLP} {this.state.totalSponsorSLP} (&#8369; {this.numberWithCommas((this.state.totalSponsorSLP * this.state.slpCurrentValue).toFixed(2))})
                                        </MDBBox>
                                    ) : ("")
                                }
                            </MDBBox>
                        </MDBCol>
                    </React.Fragment>
                )
            }
        }
    }

    // Render Modal for viewing of Manager and Sponsor's Earning
    renderModalEarnings() {
        return (
            <MDBModal isOpen={this.state.isModalEarningOpen} size="lg">
                <MDBModalHeader toggle={this.modalEarningToggle("", "", "")}>{this.state.modalEarningTitle}</MDBModalHeader>
                <MDBModalBody>
                    <MDBTable bordered striped responsive>
                        <MDBTableHead color="rgba-teal-strong" textWhite>
                            <tr>
                                <th colSpan="4" className="text-center font-weight-bold">{CONSTANTS.MESSAGE.MANAGER_EARNING}</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            <tr className="text-center">
                                <td rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{CONSTANTS.MESSAGE.TOTAL_EARNINGS}</td>
                                <td colSpan="3" className="font-weight-bold">{CONSTANTS.MESSAGE.SLP}: {this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? this.state.totalManagerSLP : this.state.totalSponsorSLP}</td>
                            </tr>
                            <tr className="text-center">
                                <td colSpan="3" className="font-weight-bold table-gray-bg">
                                    <span>&#8369; </span>
                                    {this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? (
                                        // Manager's Earning
                                        this.numberWithCommas((this.state.totalManagerSLP * this.state.slpCurrentValue).toFixed(2))
                                    ) : (
                                        // Sponsor's Earning
                                        this.numberWithCommas((this.state.totalSponsorSLP * this.state.slpCurrentValue).toFixed(2))
                                    )}
                                </td>
                            </tr>
                            <tr className="text-center">
                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.NAME}</td>
                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.INGAME} {CONSTANTS.MESSAGE.SLP}</td>
                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.SHARED} {CONSTANTS.MESSAGE.SLP}</td>
                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.EARNING}</td>
                            </tr>
                            {
                                Object.keys(this.state.modalEarningDetails).length > 0 ? (
                                    this.state.modalEarningDetails.sort((a, b) =>  b.inGameSLP - a.inGameSLP ).map(items => (
                                        <tr className="text-center">
                                            <td>{items.ranking.name} ({this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? items.details.manager : items.details.sponsor}%)</td>
                                            <td>{items.inGameSLP}</td>
                                            <td>{this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? items.sharedManagerSLP : items.sharedSponsorSLP}</td>
                                            <td>
                                                {this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? (
                                                    // Manager's Earning
                                                    this.numberWithCommas((items.sharedManagerSLP * this.state.slpCurrentValue).toFixed(2))
                                                ) : (
                                                    // Sponsor's Earning
                                                    this.numberWithCommas((items.sharedSponsorSLP * this.state.slpCurrentValue).toFixed(2))
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : ("")
                            }
                        </MDBTableBody>
                    </MDBTable>
                </MDBModalBody>
            </MDBModal>
        )
    }

    // Render single player details
    renderSingleDetails() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (Object.keys(this.state.specifPlayerRecords).length > 0) {
                return (
                    <React.Fragment>
                        {
                            // Scholar display x single display
                            this.state.specifPlayerRecords.map(items => (
                                <MDBCol key={items.client_id} sm="12" md="6" lg="4" className="my-3">
                                    <MDBCard className="z-depth-2">
                                        <MDBCardBody className="black-text">
                                            <MDBCardTitle className="font-weight-bold font-family-architects-daughter">{items.ranking.name}</MDBCardTitle>
                                            <MDBBox tag="div">
                                                <MDBBox tag="div" className="mt-3">
                                                    <MDBTable bordered striped responsive>
                                                        <MDBTableHead color="rgba-teal-strong" textWhite>
                                                            <tr>
                                                                <th colSpan="5" className="text-center font-weight-bold">{CONSTANTS.MESSAGE.SLP_DESC}</th>
                                                            </tr>
                                                        </MDBTableHead>
                                                        <MDBTableBody>
                                                            <tr className="text-center">
                                                                <td colSpan="2" rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{CONSTANTS.MESSAGE.CLAIMON}</td>
                                                                <td colSpan="3" className="font-weight-bold">{<Moment format="MMM DD, YYYY HH:MM A" add={{ days: 14 }} unix>{items.last_claimed_item_at}</Moment>}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td colSpan="3" className="font-weight-bold table-gray-bg">{<Moment durationFromNow>{items.last_claimed_item_at_add}</Moment>}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase" title="Adventure SLP Quest (Today)">{CONSTANTS.MESSAGE.ADV}</td>
                                                                <td className="font-weight-bold text-uppercase" title="In Game SLP">{CONSTANTS.MESSAGE.INGAME}</td>
                                                                <td className="font-weight-bold text-uppercase" title="In Game SLP Sharing">{CONSTANTS.MESSAGE.SHARE} ({items.details.manager === "100" ? items.details.manager : items.details.scholar}%)</td>
                                                                <td className="font-weight-bold text-uppercase" title="Ronin SLP + Sharing SLP">{CONSTANTS.MESSAGE.TOTAL}</td>
                                                                <td className="font-weight-bold text-uppercase" title="PHP Currency">{CONSTANTS.MESSAGE.EARNING}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td>0</td>
                                                                <td>{items.inGameSLP}</td>
                                                                <td>{items.sharedSLP}</td>
                                                                <td>{items.totalSLP}</td>
                                                                <td>{this.numberWithCommas((items.totalSLP * this.state.slpCurrentValue).toFixed(2))}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="5" className="text-center font-weight-bold rgba-teal-strong white-text">{CONSTANTS.MESSAGE.ARENAGAME_STATUS}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.LOSE}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.DRAW}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.MMR}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.RANK}</td>
                                                            </tr><tr className="text-center">
                                                                <td className="white-bg">{items.ranking.win_total}</td>
                                                                <td className="white-bg">{items.ranking.lose_total}</td>
                                                                <td className="white-bg">{items.ranking.draw_total}</td>
                                                                <td className="white-bg">{(items.ranking.elo).toLocaleString()}</td>
                                                                <td className="white-bg">{(items.ranking.rank).toLocaleString()}</td>
                                                            </tr>
                                                        </MDBTableBody>
                                                    </MDBTable>
                                                </MDBBox>
                                            </MDBBox>
                                        </MDBCardBody>
                                    </MDBCard>
                                </MDBCol>
                            ))
                        }
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
                            // Scholar display x sort by ELO Ranking
                            this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map(items => (
                                <MDBCol key={items.client_id} sm="12" md="6" lg="4" className="my-3">
                                    <MDBCard className="z-depth-2">
                                        <MDBCardBody className="black-text">
                                            <MDBCardTitle className="font-weight-bold font-family-architects-daughter">
                                                {items.ranking.name}
                                                {
                                                    this.state.topUserMMR !== "" && Object.keys(this.state.topUserMMR).length > 0 && this.state.topUserSLP !== "" && Object.keys(this.state.topUserSLP).length ? (
                                                        this.state.topUserMMR.ranking.name === items.ranking.name && this.state.topUserSLP.ranking.name === items.ranking.name ? (
                                                            // Top user MMR and SLP
                                                            <MDBBox tag="span" className="float-right">
                                                                <MDBIcon title={CONSTANTS.MESSAGE.TOP_MMR_SLP} icon="crown" />
                                                            </MDBBox>
                                                        ) : (
                                                            this.state.topUserMMR.ranking.name === items.ranking.name ? (
                                                                // Top user MMR
                                                                <MDBBox tag="span" className="float-right">
                                                                    <MDBIcon title={CONSTANTS.MESSAGE.TOP_MMR} icon="certificate" />
                                                                </MDBBox>
                                                            ) : (
                                                                this.state.topUserSLP.ranking.name === items.ranking.name ? (
                                                                    // Top user SLP
                                                                    <MDBBox tag="span" className="float-right">
                                                                        <MDBIcon title={CONSTANTS.MESSAGE.TOP_INGAME_SLP} icon="gem" />
                                                                    </MDBBox>
                                                                ) : ("")
                                                            )
                                                        )
                                                    ) : ("")
                                                }
                                            </MDBCardTitle>
                                            <MDBBox tag="div">
                                                <MDBBox tag="div" className="mt-3">
                                                    <MDBTable bordered striped responsive>
                                                        <MDBTableHead color="rgba-teal-strong" textWhite>
                                                            <tr>
                                                                <th colSpan="5" className="text-center font-weight-bold">{CONSTANTS.MESSAGE.SLP_DESC}</th>
                                                            </tr>
                                                        </MDBTableHead>
                                                        <MDBTableBody>
                                                            <tr className="text-center">
                                                                <td colSpan="2" rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{CONSTANTS.MESSAGE.CLAIMON}</td>
                                                                <td colSpan="3" className="font-weight-bold">{<Moment format="MMM DD, YYYY HH:MM A" add={{ days: 14 }} unix>{items.last_claimed_item_at}</Moment>}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td colSpan="3" className="font-weight-bold table-gray-bg">{<Moment durationFromNow>{items.last_claimed_item_at_add}</Moment>}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase" title="Adventure SLP Quest (Today)">{CONSTANTS.MESSAGE.ADV}</td>
                                                                <td className="font-weight-bold text-uppercase" title="In Game SLP">{CONSTANTS.MESSAGE.INGAME}</td>
                                                                <td className="font-weight-bold text-uppercase" title="In Game SLP Sharing">{CONSTANTS.MESSAGE.SHARE} ({items.details.manager === "100" ? items.details.manager : items.details.scholar}%)</td>
                                                                <td className="font-weight-bold text-uppercase" title="Ronin SLP + Sharing SLP">{CONSTANTS.MESSAGE.TOTAL}</td>
                                                                <td className="font-weight-bold text-uppercase" title="PHP Currency">{CONSTANTS.MESSAGE.EARNING}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td>0</td>
                                                                <td>{items.inGameSLP}</td>
                                                                <td>{items.sharedSLP}</td>
                                                                <td>{items.totalSLP}</td>
                                                                <td>{this.numberWithCommas((items.totalSLP * this.state.slpCurrentValue).toFixed(2))}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="5" className="text-center font-weight-bold rgba-teal-strong white-text">{CONSTANTS.MESSAGE.ARENAGAME_STATUS}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.LOSE}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.DRAW}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.MMR}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.RANK}</td>
                                                            </tr><tr className="text-center">
                                                                <td className="white-bg">{items.ranking.win_total}</td>
                                                                <td className="white-bg">{items.ranking.lose_total}</td>
                                                                <td className="white-bg">{items.ranking.draw_total}</td>
                                                                <td className="white-bg">{(items.ranking.elo).toLocaleString()}</td>
                                                                <td className="white-bg">{(items.ranking.rank).toLocaleString()}</td>
                                                            </tr>
                                                        </MDBTableBody>
                                                    </MDBTable>
                                                </MDBBox>
                                            </MDBBox>
                                        </MDBCardBody>
                                    </MDBCard>
                                </MDBCol>
                            ))
                        }
                    </React.Fragment>
                )
            }
        }
    }

    renderEmptyDetails() {
        return (
            <React.Fragment>
                <MDBRow className="justify-content-center align-self-center">
                    <MDBCol size="12" className="justify-content-center align-self-center text-center">
                        <img src="/assets/images/axie_char.png" className="w-200px mt-5" alt="No Data Found" />
                        <MDBBox tag="span" className="d-block py-3 font-size-3rem font-family-architects-daughter red-text">{CONSTANTS.MESSAGE.SOMETHING_WENT_WRONG}</MDBBox>
                        <MDBBox tag="span" className="d-block font-size-3rem font-family-architects-daughter orange-text">{CONSTANTS.MESSAGE.NODATA_FOUND}</MDBBox>
                    </MDBCol>
                </MDBRow>
            </React.Fragment>
        )
    }

    render() {
        document.title = CONSTANTS.MESSAGE.HOMETITLE;
        return (
            <MDBBox tag="div" className="home-wrapper">
                {
                    !this.state.isLoaded ? (
                        // Loading
                    <MDBBox tag="div" className="loader-section">
                        <MDBBox tag="div" className="position-fixed z-index-9999 l-0 t-0 r-0 b-0 m-auto overflow-visible flex-center">
                            <MDBBox tag="span" className="loader-spin-dual-ring"></MDBBox>
                            <MDBBox tag="span" className="ml-2 font-size-1rem white-text">{CONSTANTS.MESSAGE.LOADING_TEXT}</MDBBox>
                        </MDBBox>
                        <MDBBox tag="div" className="loader-backdrop position-fixed z-index-1040 l-0 t-0 r-0 b-0 black"></MDBBox>
                    </MDBBox>
                    ) : ("")
                }

                {/* Render Notification Bar for Page refresh, Coingecko details and Top Scholar */}
                <MDBContainer fluid className="pt-5 mt-5 position-relative">
                    <MDBRow>
                        {this.renderCoingecko()}
                        {this.renderTopScholar()}
                        {this.renderEarnings()}
                    </MDBRow>
                </MDBContainer>

                {
                    this.state.error && this.state.isLoaded ? (
                        // Empty Player details x Error in Ajax
                        <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative">
                            {this.renderEmptyDetails()}
                        </MDBContainer>
                    ) : (
                        Object.keys(this.state.playerRecords).length <= 0 ? (
                            // Empty Player details
                            <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative">
                                {this.renderEmptyDetails()}
                            </MDBContainer>
                        ) : (
                            // Diplay Player details
                            <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative">
                                <MDBRow>
                                    {
                                        Object.keys(this.state.specifPlayerRecords).length > 0 ? (
                                            // Display Single data based on credential
                                            this.renderSingleDetails()
                                        ) : (
                                            Object.keys(this.state.playerRecords).length > 0 ? (
                                                // Display all data
                                                this.renderAllDetails()
                                            ) : (
                                                // Display no data
                                                this.renderEmptyDetails()
                                            )
                                        )
                                    }
                                </MDBRow>
                            </MDBContainer>
                        )
                    )
                }

                {/* Render Modal */}
                {this.renderModalEarnings()}
            </MDBBox>
        )
    }
}

export default Home