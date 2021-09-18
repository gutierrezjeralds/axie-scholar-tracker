import React from "react";
import $ from 'jquery';
import { CONSTANTS } from '../Constants';
import { 
    MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle,
    MDBTable, MDBTableBody, MDBTableHead,
    MDBModal, MDBModalHeader, MDBModalBody,
    MDBIcon, MDBTooltip
} from "mdbreact";
import Moment from 'react-moment';
import moment from 'moment';
import { MDBDataTable } from 'mdbreact';

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
            currentValueFrm: CONSTANTS.MESSAGE.COINGECKO,
            isRecordLoaded: false,
            isPlayerLoaded: false,
            playerRecords: [],
            playerDataTable: {},
            mmrDatatable: {},
            managerEarningDatatable: {},
            totalManagerSLP: 0,
            totalSponsorSLP: 0,
            totalScholarSLP: 0,
            totalInGameSLP: 0,
            totalAverageSLP: 0,
            isModalEarningOpen: false,
            modalEarningTitle: "",
            modalEarningFilter: "",
            modalEarningDetails: {},
            isModalMMRRankOpen: false,
            modalMMRRankDetails: [],
            isModalPlayerDetailsOpen: false,
            modalPlayerDetails: [],
            topMMR: 0, // For condition of getting top user
            topSLP: 0, // For condition of getting top user
            topUserMMR: "",
            topUserSLP: "",
            isViewMangerEarning: CONSTANTS.MESSAGE.VIEW_CURRENT_EARNINGS,
            totalManagerAllSLP: 0,
            totalManagerAllPHP: 0,
            modalManagerAllEarning: []
        }
    }

    componentDidMount() {
        this.pageRefresh(120000); // Refresh in 2 minutes
        this.getCoingecko();
        // this.getBinance();
        this.getRecord();
    }

    // Adding comma in number x replacement in toLocaleString()
    numberWithCommas = (value) => {
        if (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return value;
    }

    // Modal Toggle for view of Manager and Sponsor's Earning
    modalEarningToggle = (title, filters, managerEarnings) => () => {
        this.setState({
            isModalEarningOpen: !this.state.isModalEarningOpen,
            modalEarningTitle: title,
            modalEarningFilter: filters,
            modalEarningDetails: managerEarnings
        });
    }

    // Modal Toggle for view details of MMR Ranking
    modalMMRRankToggle = (playerDetails) => () => {
        this.setState({
            isModalMMRRankOpen: !this.state.isModalMMRRankOpen,
            modalMMRRankDetails: playerDetails
        });
    }

    // Modal Toggle for view of Players details
    modalPlayerDetailsToggle = (cliendId, playerDetails) => () => {
        let details = [];
        if (cliendId && playerDetails.length > 0) {
            const findDetail = playerDetails.find(items => items.client_id === cliendId);
            if (Object.keys(findDetail).length > 0) {
                details = [findDetail];
            }
        }

        this.setState({
            isModalPlayerDetailsOpen: !this.state.isModalPlayerDetailsOpen,
            modalPlayerDetails: details
        });
    }

    // Hide and Show Manager Total Earning
    onManagerEarningHandle(event) {
        if (event.target.innerText === CONSTANTS.MESSAGE.VIEW_ALL_EARNINGS) {
            this.setState({
                isViewMangerEarning: CONSTANTS.MESSAGE.VIEW_ALL_EARNINGS,
            })
        } else {
            this.setState({
                isViewMangerEarning: CONSTANTS.MESSAGE.VIEW_CURRENT_EARNINGS,
            })
        }
    }

    // Page reload
    pageRefresh = (time) => {
        setTimeout( function() {
            window.location.reload();
        }, time);
    }

    // API reload
    apiRefresh = () => {
        setTimeout(() => {
            // this.getCoingecko();
            // this.getBinance();
        }, 5000); // Refresh in 5 seconds
    }

    // Get Binance data / json
    getBinance = () => {
        // Get Current SLP and AXS Value
        $.ajax({
            url: "https://api.binance.com/api/v3/ticker/price",
            dataType: "json",
            cache: false,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        })
        .then(
            async (result) => {
                if (result.length > 0) {
                    let isSLPValue = 0, isAXSValue = 0;
                    result.map(items => {
                        // Get SLP value in Binance result
                        if (items.symbol === "SLPUSDT") {
                            isSLPValue = items.price;
                        }
                        // Get AXS value in Binance result
                        if (items.symbol === "AXSUSDT") {
                            isAXSValue = items.price;
                        }
                        // Return
                        return true;
                    });

                    // Get value of PHP
                    const currentPHPValue = await this.getPHPCurrentValue();
                    if (currentPHPValue.data) {
                        const valuePHP = currentPHPValue.data.rates.PHP;
                        if (valuePHP !== undefined) {
                            isSLPValue = (Math.floor(isSLPValue * valuePHP)).toFixed(2);
                            isAXSValue = (Math.floor(isAXSValue * valuePHP)).toFixed(2);
                        }
                    }
                            
                    this.setState({
                        currentValueFrm: CONSTANTS.MESSAGE.BINANCE,
                        slpCurrentValue: isSLPValue,
                        axsCurrentValue: isAXSValue
                    })
                } else {
                    // Get Coingecko data / json
                    this.getCoingecko();
                    this.setState({
                        currentValueFrm: CONSTANTS.MESSAGE.COINGECKO
                    })
                }
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                // Get Coingecko data / json
                this.getCoingecko();
                this.setState({
                    currentValueFrm: CONSTANTS.MESSAGE.COINGECKO
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                // Get Coingecko data / json
                this.getCoingecko();
                this.setState({
                    currentValueFrm: CONSTANTS.MESSAGE.COINGECKO
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )
        .done(() => {
            // Refresh API
            this.apiRefresh();
        })
    }
    
    // Get Coingecko data / json
    getCoingecko = () => {
        // Get Current SLP and AXS Value
        $.ajax({
            url: "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion,axie-infinity&vs_currencies=php",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                this.setState({
                    slpCurrentValue: result["smooth-love-potion"].php,
                    axsCurrentValue: result["axie-infinity"].php
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
        .done(() => {
            // Refresh API
            this.apiRefresh();
        })
    }

    // Get frankfurter data / json
    getPHPCurrentValue = async () => {
        return new Promise((resolve, reject) => {
            // Get Current PHP Value
            $.ajax({
                url: "https://api.frankfurter.app/latest?from=USD",
                dataType: "json",
                cache: false
            })
            .then(
                (result) => {
                    return resolve({data: result});
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    return reject({error: error})
                }
            )
            .catch(
                (err) => {
                    return reject({error: err})
                }
            )
        }).catch(err => {
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }
    
    // Fetch Player Record Data
    getRecord = () => {
        $.ajax({
            url: "../assets/json/eth-address.json",
            dataType: "json",
            cache: false
        })
        .then(
            async (result) => {
                if (result.length > 0) {
                    // Fetch player details in api of sky mavis
                    const dataResultPromise = result.map(async (item) => {
                        const ethAddress = item.ethAddress ? `0x${item.ethAddress.substring(6)}` : "";
                        let userEthAddress = null;

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

                        // Return
                        return await this.getPlayerDetails(item, ethAddress, userEthAddress);
                    });

                    await Promise.all(dataResultPromise).then(async (results) => {
                        let initDisplay = [] // Data for initial display
                        let mmrDisplay = [] // Data for players MMR list display in Modal
                        let managerEarningsDisplay = [] // Data for Manager Earnings in Modal

                        const dataResult = results.filter(item => {
                            if (!item.error && item.data !== undefined && item.eth !== undefined) {
                                return item
                            }
                            return false;
                        })
                        
                        // Sort as Top MMR Ranking
                        dataResult.sort((a, b) =>  a.rank - b.rank ).map((dataItem, index) => {
                            dataItem.data.order = index + 1; // Adding ordered number

                            // Display data
                            if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
                                initDisplay.push(dataItem.data); // Data for initial display x display all
                            } else {
                                if (dataItem.eth !== null && dataItem.eth !== undefined) {
                                    initDisplay.push(dataItem.data); // Data for initial display x specific data to be display
                                }
                            }

                            // Data for players MMR list display in Modal x Pushed specific data
                            mmrDisplay.push({
                                order: dataItem.data.order,
                                name: dataItem.data.name,
                                mmr: dataItem.data.mmr,
                                rank: dataItem.data.rank
                            });

                            // Return
                            return true;
                        });

                        // Sort as Top SLP Gainer
                        dataResult.sort((a, b) =>  b.slp - a.slp ).map((dataItem, index) => {
                            dataItem.data.order = index + 1; // Adding ordered number

                            // Display data
                            if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
                                // Data for Manager Earnings in Modal x Pushed specific data
                                managerEarningsDisplay.push({
                                    name: dataItem.data.name,
                                    ingameSLP: dataItem.data.ingameSLP,
                                    sharedManagerSLP: dataItem.data.sharedManagerSLP,
                                    managerEarningsPHP: dataItem.data.managerEarningsPHP
                                });
                            }

                            // Return
                            return true;
                        });

                        // Return data x Set state
                        this.setState({
                            isLoaded: true,
                            isPlayerLoaded: true,
                            playerDataTable: {
                                columns: [
                                    {label: CONSTANTS.MESSAGE.NAME, field: "name"},
                                    {label: CONSTANTS.MESSAGE.AVERAGE_SLP_PERDAY_V2, field: "averageSLP"},
                                    {label: CONSTANTS.MESSAGE.INGAME_SLP, field: "ingameSLP"},
                                    {label: CONSTANTS.MESSAGE.SHARED_SLP, field: "sharedSLP"},
                                    {label: CONSTANTS.MESSAGE.RONIN_SLP, field: "roninSLP"},
                                    {label: CONSTANTS.MESSAGE.TOTAL_SLP, field: "totalSLP"},
                                    {label: CONSTANTS.MESSAGE.EARNINGS_PHP, field: "earningsPHP"},
                                    {label: CONSTANTS.MESSAGE.CLAIMON, field: "claimOn"},
                                    {label: CONSTANTS.MESSAGE.MMR, field: "mmr"},
                                    {label: CONSTANTS.MESSAGE.RANK, field: "rank", sort: "desc"}
                                ], rows: initDisplay
                            },
                            mmrDatatable: {
                                columns: [
                                    {label: "", field: "order"},
                                    {label: CONSTANTS.MESSAGE.NAME, field: "name"},
                                    {label: CONSTANTS.MESSAGE.MMR, field: "mmr"},
                                    {label: CONSTANTS.MESSAGE.RANK, field: "rank", sort: "desc"}
                                ], rows: mmrDisplay
                            },
                            managerEarningDatatable: {
                                columns: [
                                    {label: CONSTANTS.MESSAGE.NAME, field: "name"},
                                    {label: CONSTANTS.MESSAGE.INGAME_SLP, field: "ingameSLP"},
                                    {label: CONSTANTS.MESSAGE.SHARED_SLP, field: "sharedManagerSLP"},
                                    {label: CONSTANTS.MESSAGE.EARNINGS_PHP, field: "managerEarningsPHP"}
                                ], rows: managerEarningsDisplay
                            }
                        })

                        // console.log("playerRecords", this.state.playerRecords)
                    })
                } else {
                    // No data found
                    this.setState({
                        isLoaded: true,
                        isNotif: true,
                        notifCat: "error",
                        notifStr: CONSTANTS.MESSAGE.NODATA_FOUND,
                        error: true
                    })
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
                    if (Object.keys(result).length > 0) { // Has player details
                        // Get Player ranking base on Sky Mavis API
                        const ranking = await this.getPlayerRanking(ethAddress);
                        let roninBalance = 0, totalSLP = 0
                        if (!ranking.error) {
                            // Adding text color of MMR based on MMR level
                            ranking.textStyle = "black-text";
                            if (ranking.elo < 1300 && ranking.elo >= 1100) {
                                // Estimated SLP gain on this MRR (6SLP) x Set as warning need to up
                                ranking.textStyle = "orange-text"
                            } else if (ranking.elo < 1099) {
                                // Estimated SLP gain on this MRR (3SLP, 1SLP or NOSLP) x Set as warning need to up
                                ranking.textStyle = "red-text font-weight-bold";
                            } else {
                                // Great MMR x Can earn more SLP
                                ranking.textStyle = "green-text";
                            }

                            result.last_claimed_item_at_add = moment.unix(result.last_claimed_item_at).add(1, 'days');
                            result.claim_on_days = 0;
                            result.inGameSLP = result.total;
                            result.totalEarningSLP = result.total;
                            result.averageSLPDay = 0;
                            result.sharedManagerSLP = 0;
                            result.sharedSponsorSLP = 0;

                            // Set new value for Claim On (Days) x last_claimed_item_at_add - current date
                            const lastClaimedDate = new Date(moment.unix(result.last_claimed_item_at)).getTime();
                            const currentDate = new Date().getTime();
                            if (currentDate > lastClaimedDate) {
                                result.claim_on_days = Math.round((currentDate - lastClaimedDate) / (1000 * 3600 * 24)).toFixed(0);
                            }

                            if (result.blockchain_related === null || result.blockchain_related.signature === null) {
                                // Adding empty object
                                result.blockchain_related.signature = {
                                    amount: 0,
                                    timestamp: ""
                                }
                            }

                            result.sharedSLP = result.inGameSLP;
                            result.scholarSLP = result.inGameSLP;
                            if (Object.keys(details).length > 0) {
                                // Check if has balance in Ronin x Set new value for total in game slp
                                if (result.blockchain_related.balance !== null && result.blockchain_related.balance > 0) {
                                    roninBalance = result.blockchain_related.balance;
                                    totalSLP = result.total;
                                    result.inGameSLP = totalSLP - roninBalance;
                                }

                                if ((details.manager).toString() === "100" || details.manager > 0) { // Condition for Manager
                                    // Set new Shared SLP
                                    const managerShare = (details.manager).toString() === "100" ? 1 : "0." + details.manager;
                                    result.sharedManagerSLP = Math.floor(result.inGameSLP * managerShare);

                                    if ((details.manager).toString() === "100") {
                                        // Set new Shared SLP
                                        result.scholarSLP = 0;
                                        if (roninBalance > totalSLP) {
                                            result.sharedSLP = Math.floor(roninBalance - totalSLP);
                                        } else {
                                            result.sharedSLP = Math.floor(totalSLP - roninBalance);
                                        }

                                        // Adding ronin balance in total Manage SLP x // Set new Total Manager's Earning
                                        this.setState({
                                            totalManagerSLP: this.state.totalManagerSLP + result.sharedManagerSLP + roninBalance
                                        })
                                    } else {
                                        // Set new Total Manager's Earning
                                        this.setState({
                                            totalManagerSLP: this.state.totalManagerSLP + result.sharedManagerSLP
                                        })
                                    }
                                }

                                if ((details.sponsor).toString() !== "0" || details.sponsor > 0) { // Condition for Sponsor
                                    // Set new Shared SLP
                                    const sponsorShare = "0." + details.sponsor;
                                    result.sharedSponsorSLP = Math.floor(result.inGameSLP * sponsorShare);

                                    // Set new Total Sponsor's Earning
                                    this.setState({
                                        totalSponsorSLP: this.state.totalSponsorSLP + result.sharedSponsorSLP
                                    })
                                }

                                if ((details.scholar).toString() !== "0" || details.scholar > 0) { // Condition for Scholar Players
                                    // Set new Shared SLP
                                    const iskoShare = (details.scholar).toString() === "100" ? 1 : "0." + details.scholar;
                                    result.sharedSLP = Math.floor(result.inGameSLP * iskoShare);
                                    result.scholarSLP = Math.floor(result.inGameSLP * iskoShare);
                                }

                                // Set new total SLP x computed base on Shared SLP plus total SLP
                                result.totalEarningSLP = roninBalance + result.sharedSLP;
                                // Set new total PHP x computed base on totalEarningSLP multiply slpCurrentValue
                                result.totalEarningPHP = result.totalEarningSLP * this.state.slpCurrentValue;
                                // Set new total Manager SLP Earning x computed base on sharedManagerSLP multiply slpCurrentValue
                                result.totalManagerEarningPHP = result.sharedManagerSLP * this.state.slpCurrentValue;
                                // Set new total Sponsor SLP Earning x computed base on sharedSponsorSLP multiply slpCurrentValue
                                result.totalSponsorEarningPHP = result.sharedSponsorSLP * this.state.slpCurrentValue;

                                // Get Top User MMR and SLP
                                if (ranking.rank > this.state.topMMR || result.inGameSLP > this.state.topSLP) {
                                    if (ranking.rank > this.state.topMMR) {
                                        // Set Top User MMR
                                        this.setState({
                                            topMMR: ranking.elo,
                                            topUserMMR: details.name
                                        })
                                    }
        
                                    if (result.inGameSLP > this.state.topSLP) {
                                        // Set Top User SLP
                                        this.setState({
                                            topSLP: result.inGameSLP,
                                            topUserSLP: details.name
                                        })
                                    }
                                }

                                // Set new value for Total Income and Set value for Total Earning per claimed
                                if (details.claimedEarning.length > 0) {
                                    details.claimedEarning.map((data, index) => {
                                        const earnedSLP = data.slp;
                                        const slpPrice = data.slpPrice;
                                        const totalIncome = details.totalIncome;

                                        details.claimedEarning[index].earning = 0;
                                        if (slpPrice.toString() !== "hold") {
                                            // Adding Total Earning
                                            details.claimedEarning[index].earning = earnedSLP * slpPrice;
                                            // Update Total Income
                                            details.totalIncome = totalIncome + details.claimedEarning[index].earning;
                                        }

                                        // Return
                                        return true;
                                    })
                                }

                                // Set new value for Manager All Income and Set value for Total Earning per claimed
                                if (details.managerEarning !== undefined && details.managerEarning.length > 0) {
                                    details.managerEarning.map((data, index) => {
                                        const earnedSLP = data.slp;
                                        const slpPrice = data.slpPrice;

                                        details.managerEarning[index].earning = 0;
                                        if (slpPrice.toString() !== "hold") {
                                            // Adding Total Earning
                                            details.managerEarning[index].earning = earnedSLP * slpPrice;
                                            // Update Total Income and SLP
                                            this.setState({
                                                totalManagerAllSLP: this.state.totalManagerAllSLP + earnedSLP,
                                                totalManagerAllPHP: this.state.totalManagerAllPHP + details.managerEarning[index].earning
                                            })
                                        }

                                        // Return
                                        return true;
                                    })

                                    // Update Data for Manager All Earning
                                    this.setState({
                                        modalManagerAllEarning: details.managerEarning
                                    })
                                }

                                // Has InGame SLP
                                if (result.inGameSLP > 0) {
                                    this.setState({
                                        totalInGameSLP: this.state.totalInGameSLP + result.inGameSLP, // Set Total InGame SLP
                                        totalScholarSLP: this.state.totalScholarSLP + result.scholarSLP // Set Total Scholar SLP
                                    })

                                    // Set Average SLP per Day
                                    if (result.claim_on_days > 0) {
                                        result.averageSLPDay = Math.floor(result.inGameSLP / result.claim_on_days);
                                        this.setState({
                                            totalAverageSLP: this.state.totalAverageSLP + result.averageSLPDay
                                        })
                                    }
                                }
                            }

                            // Adding Player details and ranking in result object
                            result.details = details;
                            result.ranking = ranking;

                            // Get all ETH Address x for other display x MMR Ranking x etc
                            this.state.playerRecords.push(result);

                            // Update Player Datatable row details
                            const playerDataTableRes = {
                                name: details.name,
                                averageSLP: <MDBBox data-th={CONSTANTS.MESSAGE.AVERAGE_SLP_PERDAY_V2} tag="span">{result.averageSLPDay}</MDBBox>,
                                ingameSLP: <MDBBox data-th={CONSTANTS.MESSAGE.INGAME_SLP} tag="span">{this.numberWithCommas(result.inGameSLP)}</MDBBox>,
                                sharedSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span" className="d-inline d-md-block d-lg-block">{this.numberWithCommas(result.sharedSLP)} <MDBBox tag="span" className="d-inline d-md-block d-lg-block">({(details.manager).toString() === "100" ? details.manager : details.scholar}%)</MDBBox></MDBBox>,
                                roninSLP: <MDBBox data-th={CONSTANTS.MESSAGE.RONIN_SLP} tag="span">{this.numberWithCommas(roninBalance)}</MDBBox>,
                                totalSLP: <MDBBox data-th={CONSTANTS.MESSAGE.TOTAL_SLP} tag="span">{this.numberWithCommas(result.totalEarningSLP)}</MDBBox>,
                                earningsPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalEarningPHP).toFixed(2))}</MDBBox>,
                                claimOn: <MDBBox data-th={CONSTANTS.MESSAGE.CLAIMON} tag="span" className="d-block">{moment.unix(result.last_claimed_item_at).add(14, "days").format("MMM DD, HH:MM A")} <MDBBox tag="span" className="d-block">{result.claim_on_days} {CONSTANTS.MESSAGE.DAYS}</MDBBox></MDBBox>,
                                mmr: <MDBBox data-th={CONSTANTS.MESSAGE.MMR} tag="span" className={ranking.textStyle}>{this.numberWithCommas(ranking.elo)}</MDBBox>,
                                rank: <MDBBox data-th={CONSTANTS.MESSAGE.RANK} tag="span">{this.numberWithCommas(ranking.rank)}</MDBBox>,
                                sharedManagerSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span">{this.numberWithCommas(result.sharedManagerSLP)}</MDBBox>,
                                managerEarningsPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalManagerEarningPHP).toFixed(2))}</MDBBox>,
                                sharedSponsorSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span">{this.numberWithCommas(result.sharedSponsorSLP)}</MDBBox>,
                                sponsorEarningsPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalSponsorEarningPHP).toFixed(2))}</MDBBox>,
                                clickEvent: this.modalPlayerDetailsToggle(result.client_id, [result])
                            };
                            
                            // Success return
                            return resolve({error: false, data: playerDataTableRes, slp: result.inGameSLP, rank: ranking.rank, eth: userEthAddress});
                        } else {
                            return reject({error: true});
                        }
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
                            // Adding Win Rate
                            player.win_rate = 0;
                            if (player.win_total > 0 || player.lose_total > 0 || player.draw_total > 0) {
                                const winRate = ( (player.win_total / (player.win_total + player.lose_total + player.draw_total)) * 100 ).toFixed(2);
                                player.win_rate = winRate.toString() === "100.00" ? 100 : winRate;
                            }
                            // Return
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

    // Render Coingecko details
    renderCurrencies() {
        if (this.state.slpCurrentValue > 0) {
            return (
                <React.Fragment>
                    <MDBCol size="12" className="mb-3">
                        <MDBBox tag="div" className="py-3 px-2 text-center pale-turquoise-bg">
                            <MDBBox tag="span" className="blue-whale">
                                {CONSTANTS.MESSAGE.PRICE_BASEON}
                                
                                {
                                    this.state.currentValueFrm === CONSTANTS.MESSAGE.BINANCE ? (
                                        <a href="https://www.binance.com/en/trade/SLP_USDT" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.BINANCE}. </a>
                                    ) : (
                                        <a href="https://www.coingecko.com/en/coins/smooth-love-potion" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.COINGECKO}. </a>
                                    )
                                }
                                
                                {CONSTANTS.MESSAGE.CURRENT_EXCHANGERATE}:
                                <MDBBox tag="span" className="">
                                    <strong> 1 {CONSTANTS.MESSAGE.SLP} = {this.state.slpCurrentValue} </strong>
                                    and
                                    <strong> 1 {CONSTANTS.MESSAGE.AXS} = {this.state.axsCurrentValue}</strong>
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
            if (this.state.isUser !== CONSTANTS.MESSAGE.MANAGER && Object.keys(this.state.playerRecords).length > 0) {
                return (
                    <React.Fragment>
                        <MDBCol size="12" className="mb-3">
                            <MDBBox tag="div" className="py-3 px-2 text-center ice-bg cursor-pointer" onClick={this.modalMMRRankToggle(this.state.playerRecords)}>
                                {
                                    // Top ELO / MMR Rank
                                    this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map((items, index) => (
                                        index === 0 ? (
                                            <MDBBox key={items.client_id} tag="span" className="d-block d-md-inline d-lg-inline">{CONSTANTS.MESSAGE.TOP_MMR}: <strong>{items.details.name} ({items.ranking.elo})</strong></MDBBox>
                                        ) : ("")
                                    ))
                                }

                                {
                                    // Top In Game SLP
                                    this.state.playerRecords.sort((a, b) =>  b.inGameSLP - a.inGameSLP ).map((items, index) => (
                                        index === 0 ? (
                                            <MDBBox key={items.client_id} tag="span" className="d-block d-md-inline d-lg-inline ml-2">{CONSTANTS.MESSAGE.TOP_INGAME_SLP}: <strong>{items.details.name} ({items.inGameSLP})</strong></MDBBox>
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

    // Render Modal for viewing of MMR Ranking
    renderModalMMRRank() {
        return (
            <React.Fragment>
                <MDBModal isOpen={this.state.isModalMMRRankOpen} size="lg">
                    <MDBModalHeader toggle={this.modalMMRRankToggle("")}>{CONSTANTS.MESSAGE.MMR_RANKING}</MDBModalHeader>
                    <MDBModalBody>
                        <MDBDataTable
                            striped bordered hover responsive noBottomColumns
                            sortable={false}
                            entries={5}
                            displayEntries={false}
                            data={this.state.mmrDatatable}
                            className="default-datatable-container text-center"
                        />
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render Total Earnings of Manager, Scholar and Sponsor
    renderEarnings() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
                return (
                    <React.Fragment>
                        {/* Top MMR and SLP */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text cursor-pointer d-flex-center" onClick={this.modalMMRRankToggle(this.state.playerRecords)}>
                                    <MDBBox tag="div" className="text-center">
                                        {
                                            // Top ELO / MMR Rank
                                            this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map((items, index) => (
                                                index === 0 ? (
                                                    <React.Fragment key={items.client_id}>
                                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOP_MMR}</MDBBox>
                                                        <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold">{items.details.name} ({this.numberWithCommas(items.ranking.elo)})</MDBBox>
                                                    </React.Fragment>
                                                ) : ("")
                                            ))
                                        }

                                        {
                                            // Top In Game SLP
                                            this.state.playerRecords.sort((a, b) =>  b.inGameSLP - a.inGameSLP ).map((items, index) => (
                                                index === 0 ? (
                                                    <React.Fragment key={items.client_id}>
                                                        <MDBBox tag="span" className="d-block mt-3">{CONSTANTS.MESSAGE.TOP_INGAME_SLP}</MDBBox>
                                                        <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold">{items.details.name} ({this.numberWithCommas(items.inGameSLP)})</MDBBox>
                                                    </React.Fragment>
                                                ) : ("")
                                            ))
                                        }
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total Average SLP of all players */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text d-flex-center">
                                    <MDBBox tag="div" className="text-center">
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOTAL_AVERAGE_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                            <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                            {this.numberWithCommas(Math.floor(this.state.totalAverageSLP / this.state.playerRecords.length))}
                                        </MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas(((this.state.totalAverageSLP / this.state.playerRecords.length) * this.state.slpCurrentValue).toFixed(2))}</MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total SLP of all players */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text d-flex-center">
                                    <MDBBox tag="div" className="text-center">
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOTAL_INGAME_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                            <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                            {this.numberWithCommas(this.state.totalInGameSLP)}
                                        </MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((this.state.totalInGameSLP * this.state.slpCurrentValue).toFixed(2))}</MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total Manager SLP */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text cursor-pointer d-flex-center" onClick={this.modalEarningToggle(CONSTANTS.MESSAGE.MANAGER_EARNING, CONSTANTS.MESSAGE.MANAGER, this.state.managerEarningDatatable)}>
                                    <MDBBox tag="div" className="text-center">
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOTAL_MANAGER_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                            <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                            {this.numberWithCommas(this.state.totalManagerSLP)}
                                        </MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((this.state.totalManagerSLP * this.state.slpCurrentValue).toFixed(2))}</MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total Sponsor SLP */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text d-flex-center">
                                    <MDBBox tag="div" className="text-center">
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOTAL_SPONSOR_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                            <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                            {this.numberWithCommas(this.state.totalSponsorSLP)}
                                        </MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((this.state.totalSponsorSLP * this.state.slpCurrentValue).toFixed(2))}</MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total Scholar SLP */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 ice-bg h-180px">
                                <MDBCardBody className="black-text d-flex-center">
                                    <MDBBox tag="div" className="text-center">
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOTAL_SCHOLAR_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                            <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                            {this.numberWithCommas(this.state.totalScholarSLP)}
                                        </MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((this.state.totalScholarSLP * this.state.slpCurrentValue).toFixed(2))}</MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </React.Fragment>
                )
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
                                            <MDBBox tag="span" className="blue-whale d-block cursor-pointer" onClick={this.modalEarningToggle(CONSTANTS.MESSAGE.VIEW_SPONSOR_EARNING, CONSTANTS.MESSAGE.SPONSOR, this.state.playerRecords)}>
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
    }

    // Render Modal for viewing of Manager and Sponsor's Earning
    renderModalEarnings() {
        return (
            <React.Fragment>
                <MDBModal isOpen={this.state.isModalEarningOpen} size="lg">
                    <MDBModalHeader toggle={this.modalEarningToggle("", "", "")}>{this.state.modalEarningTitle}</MDBModalHeader>
                    <MDBModalBody>
                        {
                            this.state.isViewMangerEarning === CONSTANTS.MESSAGE.VIEW_CURRENT_EARNINGS || this.state.isUser !== CONSTANTS.MESSAGE.MANAGER ? (
                                // Manager Current Earnings
                                <React.Fragment>
                                    <MDBBox tag="u" className="d-block mb-2 cursor-pointer" onClick={this.onManagerEarningHandle.bind(this)}>{CONSTANTS.MESSAGE.VIEW_ALL_EARNINGS}</MDBBox> {/* Opposite label x for hide and show */}
                                    <MDBBox tag="span" className="d-block mb-2">
                                        {CONSTANTS.MESSAGE.TOTAL_CURRENT_EARNINGS}:
                                        <MDBBox tag="span" className="d-block d-md-inline d-lg-inline">
                                            <MDBBox tag="span">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                <strong>{this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? this.state.totalManagerSLP : this.state.totalSponsorSLP}</strong>
                                            </MDBBox>
                                            <MDBBox tag="span" className> 
                                                <span> &#8776; &#8369; </span>
                                                <strong>
                                                    {this.state.modalEarningFilter === CONSTANTS.MESSAGE.MANAGER ? (
                                                        // Manager's Earning
                                                        this.numberWithCommas((this.state.totalManagerSLP * this.state.slpCurrentValue).toFixed(2))
                                                    ) : (
                                                        // Sponsor's Earning
                                                        this.numberWithCommas((this.state.totalSponsorSLP * this.state.slpCurrentValue).toFixed(2))
                                                    )}
                                                </strong>
                                            </MDBBox>
                                        </MDBBox>
                                    </MDBBox>
                                    <MDBDataTable
                                        striped bordered hover responsive noBottomColumns
                                        searching={false}
                                        sortable={false}
                                        entries={5}
                                        displayEntries={false}
                                        data={this.state.modalEarningDetails}
                                        className="default-datatable-container text-center"
                                    />
                                </React.Fragment>
                            ) : (
                                // Manager All Earnings
                                <React.Fragment>
                                    <MDBBox tag="u" className="d-block mb-2 cursor-pointer" onClick={this.onManagerEarningHandle.bind(this)}>{CONSTANTS.MESSAGE.VIEW_CURRENT_EARNINGS}</MDBBox> {/* Opposite label x for hide and show */}
                                    <MDBTable scrollY maxHeight="70vh" bordered striped responsive>
                                        <MDBTableHead color="rgba-teal-strong" textWhite>
                                            <tr>
                                                <th colSpan="4" className="text-center font-weight-bold">{CONSTANTS.MESSAGE.MANAGER_EARNING}</th>
                                            </tr>
                                        </MDBTableHead>
                                        <MDBTableBody>
                                            <tr className="text-center">
                                                <td rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{CONSTANTS.MESSAGE.TOTAL_EARNINGS}</td>
                                                <td colSpan="3" className="font-weight-bold">{CONSTANTS.MESSAGE.SLP}: {this.numberWithCommas(this.state.totalManagerAllSLP)}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td colSpan="3" className="font-weight-bold table-gray-bg"><span>&#8369; </span>{this.numberWithCommas((this.state.totalManagerAllPHP).toFixed(2))}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.DATE}</td>
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.SLP}</td>
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.SLP_PRICE}</td>
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.EARNING}</td>
                                            </tr>
                                            {
                                                Object.keys(this.state.modalManagerAllEarning).length > 0 ? (
                                                    this.state.modalManagerAllEarning.sort((a, b) =>  b.id - a.id ).map(items => (
                                                        <tr key={items.id} className="text-center">
                                                            <td>{<Moment format="MMM DD, YYYY">{items.date}</Moment>}</td>
                                                            <td>{items.slp}</td>
                                                            <td className="text-uppercase">{items.slpPrice}</td>
                                                            <td>{(items.earning).toLocaleString()}</td>
                                                        </tr>
                                                    ))
                                                ) : ("")
                                            }
                                        </MDBTableBody>
                                    </MDBTable>
                                </React.Fragment>
                            )
                        }
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render Modal for viewing of Players Details
    renderModalPlayerDetails() {
        return (
            <React.Fragment>
                <MDBModal isOpen={this.state.isModalPlayerDetailsOpen} size="lg">
                    <MDBModalHeader toggle={this.modalPlayerDetailsToggle("", "")}>
                        {
                            Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                <React.Fragment>
                                    {this.state.modalPlayerDetails[0].details.name}
                                </React.Fragment>
                            ) : (CONSTANTS.MESSAGE.DETAILS)
                        }
                    </MDBModalHeader>
                    <MDBModalBody>
                        {/* Header details */}
                        {
                            Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                this.state.modalPlayerDetails.map((items, index) => (
                                    index === 0 ? (
                                        // Retreive only first loop x must be single display x "this.state.modalPlayerDetails" is already filtered
                                        <React.Fragment key={items.client_id}>
                                            <MDBRow between>
                                                {/* Started pplaying */}
                                                <MDBCol size="12" md="6" lg="6">
                                                    <MDBBox tag="span" className="d-block">
                                                        {CONSTANTS.MESSAGE.STARTED} <Moment format="MMM DD, YYYY">{items.details.started}</Moment>
                                                    </MDBBox>
                                                </MDBCol>
                                                {/* Market Place link */}
                                                <MDBCol size="12" md="6" lg="6">
                                                    <MDBBox tag="u" className="d-block d-md-none d-lg-none">
                                                        <a href={"https://marketplace.axieinfinity.com/profile/" + items.details.ethAddress + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                            {CONSTANTS.MESSAGE.OPEN_MARKETPLACE_PROFILE}
                                                        </a>
                                                    </MDBBox>
                                                    <MDBBox tag="u" className="d-none d-md-block d-lg-block text-right">
                                                        <a href={"https://marketplace.axieinfinity.com/profile/" + items.details.ethAddress + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                            {CONSTANTS.MESSAGE.OPEN_MARKETPLACE_PROFILE}
                                                        </a>
                                                    </MDBBox>
                                                </MDBCol>
                                            </MDBRow>
                                        </React.Fragment>
                                    ) : ("")
                                ))
                            ) : ("")
                        }

                        {/* Table Details */}
                        <MDBTable scrollY maxHeight="70vh" bordered striped responsive className="mt-2">
                            <MDBTableBody>
                                {/* Arena Game Status */}
                                <tr>
                                    <td colSpan="4" className="text-center font-weight-bold rgba-teal-strong white-text">{CONSTANTS.MESSAGE.ARENAGAME_STATUS}</td>
                                </tr>
                                <tr className="text-center">
                                    <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN}</td>
                                    <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.LOSE}</td>
                                    <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.DRAW}</td>
                                    <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN_RATE}</td>
                                </tr>
                                {
                                    Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                        this.state.modalPlayerDetails.map(items => (
                                            <tr key={items.id} className="text-center">
                                                <td className="white-bg">{items.ranking.win_total}</td>
                                                <td className="white-bg">{items.ranking.lose_total}</td>
                                                <td className="white-bg">{items.ranking.draw_total}</td>
                                                <td className="white-bg">{items.ranking.win_rate}%</td>
                                            </tr>
                                        ))
                                    ) : ("")
                                }
                                {/* Total Income */}
                                <tr>
                                    <td colSpan="4" className="text-center font-weight-bold rgba-teal-strong white-text">
                                        <span>{CONSTANTS.MESSAGE.TOTALINCOME}: &#8369; </span>
                                        {
                                            Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                                <React.Fragment>
                                                    {(this.state.modalPlayerDetails[0].details.totalIncome).toLocaleString()}
                                                </React.Fragment>
                                            ) : ("0")
                                        }
                                    </td>
                                </tr>
                                <tr className="text-center">
                                    <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.DATE}</td>
                                    <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.SLP}</td>
                                    <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.SLP_PRICE}</td>
                                    <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.EARNING}</td>
                                </tr>
                                {
                                    Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                        Object.keys(this.state.modalPlayerDetails[0].details.claimedEarning).length > 0 ? (
                                            (this.state.modalPlayerDetails[0].details.claimedEarning).sort((a, b) =>  b.id - a.id ).map(items => (
                                                <tr key={items.id} className="text-center">
                                                    <td>{<Moment format="MMM DD, YYYY">{items.date}</Moment>}</td>
                                                    <td>{items.slp}</td>
                                                    <td className="text-uppercase">{items.slpPrice}</td>
                                                    <td>{(items.earning).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : ("")
                                    ) : ("")
                                }
                            </MDBTableBody>
                        </MDBTable>
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render all players details
    renderAllDetails() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (Object.keys(this.state.playerRecords).length > 0) {
                return (
                    <React.Fragment>
                        {
                            // Scholar display x sort by ELO Ranking
                            this.state.playerRecords.sort((a, b) =>  a.ranking.rank - b.ranking.rank ).map((items) => (
                                <MDBCol key={items.client_id} sm="12" md="6" lg="4" className="my-3">
                                    <MDBCard className="z-depth-2">
                                        <MDBCardBody className="black-text">
                                            <MDBCardTitle className="font-weight-bold font-family-architects-daughter">
                                                <MDBTooltip domElement tag="span" placement="top">
                                                    <span>
                                                        <a href={"https://marketplace.axieinfinity.com/profile/" + items.details.ethAddress + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                            {items.details.name}
                                                        </a>
                                                    </span>
                                                    <span>{CONSTANTS.MESSAGE.OPEN_MARKETPLACE_PROFILE} {CONSTANTS.MESSAGE.OF} {items.details.name}</span>
                                                </MDBTooltip>
                                                {
                                                    this.state.topUserMMR !== "" && this.state.topUserSLP !== "" ? (
                                                        this.state.topUserMMR === items.details.name && this.state.topUserSLP === items.details.name ? (
                                                            // Top user MMR and SLP
                                                            <MDBBox tag="span" className="float-right">
                                                                <MDBTooltip domElement tag="span" placement="top">
                                                                    <span><MDBIcon icon="crown" /></span>
                                                                    <span>{CONSTANTS.MESSAGE.TOP_MMR_SLP}</span>
                                                                </MDBTooltip>
                                                            </MDBBox>
                                                        ) : (
                                                            // Display MRR detail
                                                            <MDBBox tag="span" className="float-right mt-1 font-size-1rem font-family-default font-weight-normal">
                                                                <MDBBox tag="span" className="font-weight-bold">{CONSTANTS.MESSAGE.MMR}:</MDBBox> {(items.ranking.elo).toLocaleString()}
                                                            </MDBBox>
                                                        )
                                                    ) : ("")
                                                }
                                            </MDBCardTitle>
                                            <MDBBox tag="div">
                                                <MDBBox tag="div" className="mt-3">
                                                    <MDBBox tag="u" className="text-decoration cursor-pointer" onClick={this.modalPlayerDetailsToggle(items.client_id, this.state.playerRecords)}>
                                                        {CONSTANTS.MESSAGE.VIEW_TOTALINCOME}
                                                    </MDBBox>
                                                    <MDBBox tag="span" className="float-right">
                                                        {CONSTANTS.MESSAGE.STARTED} <Moment format="MMM DD, YYYY">{items.details.started}</Moment>
                                                    </MDBBox>
                                                    <MDBTable className="mt-2" bordered striped responsive>
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
                                                                <td colSpan="3" className="font-weight-bold table-gray-bg">{items.claim_on_days} {CONSTANTS.MESSAGE.DAYS}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase">
                                                                    <MDBTooltip domElement tag="span" placement="top">
                                                                        <span>{CONSTANTS.MESSAGE.AVERAGE}</span>
                                                                        <span>{CONSTANTS.MESSAGE.AVERAGE_SLP_PERDAY}</span>
                                                                    </MDBTooltip>
                                                                </td>
                                                                <td className="font-weight-bold text-uppercase">
                                                                    <MDBTooltip domElement tag="span" placement="top">
                                                                        <span>{CONSTANTS.MESSAGE.INGAME}</span>
                                                                        <span>{CONSTANTS.MESSAGE.INGAME_SLP}</span>
                                                                    </MDBTooltip>
                                                                </td>
                                                                <td className="font-weight-bold text-uppercase">
                                                                    <MDBTooltip domElement tag="span" placement="top">
                                                                        <span>
                                                                            {CONSTANTS.MESSAGE.SHARE}
                                                                            <span className="font-size-pt7rem ml-1">
                                                                                ({(items.details.manager).toString() === "100" ? items.details.manager : items.details.scholar}%)
                                                                            </span>
                                                                        </span>
                                                                        <span>{CONSTANTS.MESSAGE.INGAME_SLP_SHARING}</span>
                                                                    </MDBTooltip>
                                                                </td>
                                                                <td className="font-weight-bold text-uppercase">
                                                                    <MDBTooltip domElement tag="span" placement="top">
                                                                        <span>{CONSTANTS.MESSAGE.TOTAL}</span>
                                                                        <span>{CONSTANTS.MESSAGE.RONIN_PLUS_SHARING_SLP}</span>
                                                                    </MDBTooltip>
                                                                </td>
                                                                <td className="font-weight-bold text-uppercase">
                                                                    <MDBTooltip domElement tag="span" placement="top">
                                                                        <span>{CONSTANTS.MESSAGE.EARNING}</span>
                                                                        <span>{CONSTANTS.MESSAGE.PHP_CURRENCY}</span>
                                                                    </MDBTooltip>
                                                                </td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td>{items.averageSLPDay}</td>
                                                                <td>{items.inGameSLP}</td>
                                                                <td>{items.sharedSLP}</td>
                                                                <td>{items.totalSLP}</td>
                                                                <td>{items.totalEarningPHP}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="5" className="text-center font-weight-bold rgba-teal-strong white-text">{CONSTANTS.MESSAGE.ARENAGAME_STATUS}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.LOSE}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.DRAW}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.WIN_RATE}</td>
                                                                <td className="font-weight-bold text-uppercase table-gray-bg">{CONSTANTS.MESSAGE.RANK}</td>
                                                            </tr>
                                                            <tr className="text-center">
                                                                <td className="white-bg">{items.ranking.win_total}</td>
                                                                <td className="white-bg">{items.ranking.lose_total}</td>
                                                                <td className="white-bg">{items.ranking.draw_total}</td>
                                                                <td className="white-bg">{items.ranking.win_rate}%</td>
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
                <MDBContainer className="pt-5 mt-5 position-relative">
                    <MDBRow>
                        {this.renderCurrencies()}
                        {this.renderTopScholar()}
                        {this.renderEarnings()}
                    </MDBRow>
                </MDBContainer>

                {
                    this.state.error && this.state.isLoaded ? (
                        // Empty Player details x Error in Ajax
                        <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative display-margin">
                            {this.renderEmptyDetails()}
                            {this.pageRefresh(5000)} {/* Refresh in 5 seconds if there's an error */}
                        </MDBContainer>
                    ) : (
                        Object.keys(this.state.playerRecords).length <= 0 ? (
                            // Empty Player details
                            <MDBContainer fluid className="pt-3 pb-5 mb-5 position-relative display-margin">
                                {this.renderEmptyDetails()}
                            </MDBContainer>
                        ) : (
                            // Diplay Player details
                            <MDBContainer className="pt-3 pb-5 mb-5 position-relative display-margin">
                                <MDBRow>
                                    {
                                        Object.keys(this.state.playerRecords).length > 0 ? (
                                            // Display all data
                                            <MDBCol size="12">
                                                <MDBDataTable
                                                    striped bordered hover responsive noBottomColumns
                                                    sortable={false}
                                                    data={this.state.playerDataTable}
                                                    className="player-datatable-container"
                                                />
                                            </MDBCol>
                                            // this.renderAllDetails()
                                        ) : (
                                            // Display no data
                                            this.renderEmptyDetails()
                                        )
                                    }
                                </MDBRow>
                            </MDBContainer>
                        )
                    )
                }

                {/* Render Modal */}
                {this.renderModalEarnings()}
                {this.renderModalMMRRank()}
                {this.renderModalPlayerDetails()}
            </MDBBox>
        )
    }
}

export default Home