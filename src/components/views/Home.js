import React from "react";
import $ from 'jquery';
import { CONSTANTS } from '../Constants';
import { 
    MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody,
    MDBTable, MDBTableBody, MDBTableHead,
    MDBModal, MDBModalHeader, MDBModalBody,
    MDBDataTable, MDBIcon, MDBAnimation
} from "mdbreact";
import Moment from 'react-moment';
import moment from 'moment';
import Cookies from 'js-cookie'
import emailjs from 'emailjs-com';
import Lightbox from 'react-image-lightbox';
// import ReactExport from "react-export-excel";

// Export data
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const guildImages = [
    '/assets/images/guides/buff_debuff.jpg',
    '/assets/images/guides/attack_details.jpg',
    '/assets/images/guides/battle_phase.jpeg',
    '/assets/images/guides/damange.jpg',
    '/assets/images/guides/scholar_guide_details.jpg',
    '/assets/images/guides/aventure_repeat.jpg',
    '/assets/images/guides/adventure_map.jpg',
    '/assets/images/guides/arena_slp_rewards_1.jpg',
    '/assets/images/guides/arena_slp_rewards_2.jpg'
];

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
            managerPHPInvestment: 339000, // Estimated Investment
            managerPHPROI: 0,
            managerPHPBreed: 0,
            managerPHPBuy: 0,
            managerPHPIncome: 0,
            managerPHPReachedROI: false,
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
            modalManagerAllEarning: [],
            photoIndex: 0,
            isLightBoxOpen: false,
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

        // Guide information button Bounce every 5 seconds
        setInterval(function() {
            $(".guides-btn").removeClass("bounce").removeAttr("style");
            setTimeout(function() {
                $(".guides-btn").addClass("bounce").css({"animation-name": "bounce", "visibility": "visible", "animation-iteration-count": "1"});
            }, 1000);
        }, 5000);
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

    // Send Email Message for lower MMR
    sendMMRMessage = (name, email, mmr, message) => {
        if (name && email && mmr) {
            // EDM Content
            const eDMData = {
                service_id: "gmail",
                template_id: "template_gwqFwjqA",
                template_params: {
                    "from_name": name,
                    "to_email": email,
                    "subject": CONSTANTS.MESSAGE.EMAIL_LOWMMR_SUBJECT,
                    "message": message,
                    "mmr": this.numberWithCommas(mmr)
                },
                user_id: "user_DKcMwG40VRnkIFionziRA"
            }

            // Get cookie if already sent an email x single send every browser open x based on cookies
            const sendMMREmail = Cookies.get("sendMMREmail");
            if (sendMMREmail && sendMMREmail !== undefined) {
                // Check if already sent an email x if not, send email
                const checker = sendMMREmail.split(",");
                if (checker && checker !== undefined && !checker.includes(name)) {
                    // Send email x not exist in cookie
                    this.sendEmail(eDMData);
                    // Add new name in cookie
                    Cookies.set("sendMMREmail", [checker, name]);
                }
            } else {
                // Send email if not exist in cookie
                this.sendEmail(eDMData);
                // Add new name in cookie
                Cookies.set("sendMMREmail", [name]);
            }
        }
    }

    // Run ajax for sending email
    sendEmail = (eDMData) => {
        emailjs.send(eDMData.service_id, eDMData.template_id, eDMData.template_params, eDMData.user_id)
        .then(function(response) {
            // Sent successful
            console.log('Message successfully sent!', eDMData.template_params.from_name, response.status, response.text);
        }, function() {
            // Send Email via Ajax
            $.ajax({
                url: "https://api.emailjs.com/api/v1.0/email/send",
                type: 'POST',
                data: JSON.stringify(eDMData),
                contentType: 'application/json',
                cache: false
            })
            .then(
                (result) => {
                    // Sent successful
                    console.log('Message successfully sent!', eDMData.template_params.from_name, result.status, result.text);
                },
                (error) => {
                    console.error('Oh well, you failed. Here some thoughts on the error that occured:', error)
                }
            )
            .catch(
                (err) => {
                    console.error('Oh well, you failed. Here some thoughts on the error that occured:', err)
                }
            )
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
                        const ethAddress = item.roninAddress ? `0x${item.roninAddress.substring(6)}` : "";
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

                        const dataResult = results.filter(item => !item.error && item.data !== undefined && item.eth !== undefined); // Filter valid data
                        if (dataResult && dataResult.length > 0) {
                            // Sort as Top MMR Ranking
                            dataResult.sort((a, b) =>  a.rank - b.rank ).map((dataItem, index) => {
                                dataItem.data.order = index + 1; // Adding ordered number

                                // Get Top MMR Player
                                if (dataItem.data.order === 1) {
                                    this.setState({
                                        topUserMMR: dataItem.data.nameMmr ? dataItem.data.nameMmr : ""
                                    })
                                }
    
                                // Display data
                                if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
                                    initDisplay.push(dataItem.data); // Data for initial display x display all
                                } else {
                                    if (dataItem.eth !== null) {
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
    
                                // Get Top InGame SLP Player
                                if (dataItem.data.order === 1) {
                                    this.setState({
                                        topUserSLP: dataItem.data.nameInGameSLP ? dataItem.data.nameInGameSLP : ""
                                    })
                                }

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

                            // Adding body document if the playerDataTableis single data x initDisplay
                            if (initDisplay.length <= 1) {
                                document.body.classList.add('single-player-datatable-handler');
                            }
    
                            // Return data x Set state
                            this.setState({
                                isLoaded: true,
                                isPlayerLoaded: true,
                                playerDataTable: {
                                    columns: [
                                        {label: CONSTANTS.MESSAGE.NAME, field: "name"},
                                        {label: CONSTANTS.MESSAGE.AVG_SLP_PERDAY, field: "averageSLP"},
                                        {label: CONSTANTS.MESSAGE.INGAME_SLP, field: "ingameSLP"},
                                        {label: CONSTANTS.MESSAGE.SHARED_SLP, field: "sharedScholarSLP"},
                                        {label: CONSTANTS.MESSAGE.RONIN_SLP, field: "roninSLP"},
                                        {label: CONSTANTS.MESSAGE.TOTAL_SLP, field: "totalScholarEarningSLP"},
                                        {label: CONSTANTS.MESSAGE.EARNINGS_PHP, field: "totalScholarEarningPHP"},
                                        {label: CONSTANTS.MESSAGE.CLAIMON, field: "claimOn"},
                                        {label: CONSTANTS.MESSAGE.PVP_ENERGY, field: "pvpEnergy"},
                                        {label: CONSTANTS.MESSAGE.MMR, field: "mmrRank"}
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
                        // Get Player battle log base on Game API Axie Technology
                        const battleLogs = await this.getPlayerBattleLog(details.roninAddress, ethAddress, details.pvpEnergy);

                        // Creating object
                        let roninBalance = 0, totalSLP = 0
                        if (ranking.error === undefined) {
                            // Adding text color of MMR based on MMR level
                            ranking.textStyle = "black-text";
                            ranking.eloStatus = "default";
                            if (ranking.elo < 1300 && ranking.elo >= 1100) {
                                // Estimated SLP gain on this MRR (6SLP) x Set as warning need to up
                                ranking.textStyle = "orange-text";
                                ranking.eloStatus = "warning";
                            } else if (ranking.elo < 1099) {
                                // Estimated SLP gain on this MRR (3SLP, 1SLP or NOSLP) x Set as warning need to up
                                ranking.textStyle = "red-text font-weight-bold";
                                ranking.eloStatus = "danger";
                            } else {
                                // Great MMR x Can earn more SLP
                                ranking.textStyle = "green-text";
                                ranking.eloStatus = "success";
                            }

                            result.name = ranking.name ? ranking.name : "";
                            result.last_claimed_item_at_add = moment.unix(result.last_claimed_item_at).add(1, 'days');
                            result.claim_on_days = 0;
                            result.inGameSLP = result.total;
                            result.totalScholarEarningSLP = result.total;
                            result.averageSLPDay = 0;
                            result.sharedManagerSLP = 0;
                            result.sharedSponsorSLP = 0;
                            result.pvp_energy = details.pvp_energy !== undefined ? details.pvp_energy + "/" + details.pvp_energy : "20/20"; // 20 is Default energy
                            result.managerRoninClaimed = false;

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

                            result.sharedScholarSLP = result.inGameSLP;
                            result.scholarSLP = result.inGameSLP;
                            if (Object.keys(details).length > 0) {
                                // Update name if the orig name is empty
                                result.name = result.name ? result.name : details.name ? details.name : ethAddress;

                                // Check if has balance in Ronin x Set new value for total in game slp
                                if (result.blockchain_related.balance !== null && result.blockchain_related.balance > 0) {
                                    roninBalance = result.blockchain_related.balance;
                                    totalSLP = result.total;
                                    result.inGameSLP = totalSLP - roninBalance;
                                }

                                if ((details.manager).toString() === "100" || details.manager > 0) { // Condition for Manager
                                    // Set new Shared SLP
                                    const managerShare = (details.manager).toString() === "100" ? 1 : "0." + details.manager;
                                    result.sharedManagerSLP = Math.ceil(result.inGameSLP * managerShare);

                                    if ((details.manager).toString() === "100") {
                                        // Set new Shared SLP
                                        result.scholarSLP = 0;
                                        if (roninBalance > totalSLP) {
                                            result.sharedScholarSLP = Math.ceil(roninBalance - totalSLP);
                                        } else {
                                            result.sharedScholarSLP = Math.ceil(totalSLP - roninBalance);
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
                                    result.sharedScholarSLP = Math.floor(result.inGameSLP * iskoShare);
                                    result.scholarSLP = Math.floor(result.inGameSLP * iskoShare);
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
                                    details.roi = 0;
                                    details.income = 0;
                                    details.breed = 0;
                                    details.buy = 0;
                                    details.reachedRoi = false; // For validation if ROI is completed
                                    details.managerEarning.map((data, index) => {
                                        const earnedSLP = data.slp;
                                        const slpPrice = data.slpPrice;

                                        details.managerEarning[index].earning = 0;
                                        // Adding Total Earning
                                        details.managerEarning[index].earning = earnedSLP * slpPrice;
                                        // Update Total Income and SLP
                                        this.setState({
                                            totalManagerAllSLP: this.state.totalManagerAllSLP + earnedSLP,
                                            totalManagerAllPHP: this.state.totalManagerAllPHP + details.managerEarning[index].earning
                                        })

                                        if (data.category && (data.category.toLowerCase()) === "withdraw") {
                                            if (!this.state.managerPHPReachedROI) {
                                                // Adding Return of Investment
                                                this.setState({
                                                    managerPHPROI: this.state.managerPHPROI + details.managerEarning[index].earning
                                                })

                                                // Reached the ROI
                                                if (this.state.managerPHPROI >= this.state.managerPHPInvestment) {
                                                    this.setState({
                                                        managerPHPReachedROI: true
                                                    })
                                                }
                                            } else {
                                                // Adding total of Income
                                                this.setState({
                                                    managerPHPIncome: this.state.managerPHPIncome + details.managerEarning[index].earning
                                                })
                                            }
                                        }

                                        if (data.category && (data.category.toLowerCase()) === "breed") {
                                            // Adding total cost for breeding
                                            this.setState({
                                                managerPHPBreed: this.state.managerPHPBreed + details.managerEarning[index].earning
                                            })
                                            details.breed = details.breed + details.managerEarning[index].earning;
                                        }

                                        if (data.category && (data.category.toLowerCase()) === "buy") {
                                            // Adding total cost for buying axie
                                            this.setState({
                                                managerPHPBuy: this.state.managerPHPBuy + details.managerEarning[index].earning
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

                                    // Minus the total InGame SLP and add in ronin if has Manager SLP Claimed x Manager Ronin Claimed
                                    if (details.managerClaimed > 0) {
                                        result.managerRoninClaimed = true; // Indicator for Manager Claimed
                                        // Minus the InGame SLP
                                        if (result.inGameSLP > details.managerClaimed) {
                                            result.inGameSLP = result.inGameSLP - details.managerClaimed;
                                        } else {
                                            result.inGameSLP = details.managerClaimed - result.inGameSLP;
                                        }
                                        
                                        // Add Manager Claimed in Ronin
                                        roninBalance = roninBalance + details.managerClaimed;

                                        // Update Manager Shared
                                        if (result.inGameSLP > details.managerClaimed) {
                                            const managerShare = (details.manager).toString() === "100" ? 1 : "0." + details.manager;
                                            const currentInGameSLP = result.inGameSLP - details.managerClaimed; // Minus again for computation of Manager Shared SLP
                                            result.sharedManagerSLP = Math.ceil(currentInGameSLP * managerShare);
                                            // Adding ronin balance in total Manage SLP x // Set new Total Manager's Earning
                                            this.setState({
                                                totalManagerSLP: this.state.totalManagerSLP + result.sharedManagerSLP + roninBalance
                                            })
                                        } else {
                                            // Zero manager shared
                                            result.sharedManagerSLP = 0;
                                        }
                                    }
                                }

                                // Send Email if the MMR is low x for Scholar's only x send if user is manager
                                if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER) {
                                    if (ranking.eloStatus === "danger") {
                                        // Send an Email due to Lower MMR
                                        this.sendMMRMessage(result.name, details.email, ranking.elo, CONSTANTS.MESSAGE.EMAIL_LOWMMR_MESSAGE);
                                    }
    
                                    if (ranking.eloStatus === "warning") {
                                        // Send an Email due to Warning MMR
                                        // this.sendMMRMessage(result.name, details.email, ranking.elo, CONSTANTS.MESSAGE.EMAIL_WARNINGMMR_MESSAGE);
                                    }
                                }

                                // Set new total SLP x computed base on Shared SLP plus total SLP
                                result.totalScholarEarningSLP = roninBalance + result.sharedScholarSLP;
                                // Set new total PHP x computed base on totalScholarEarningSLP multiply slpCurrentValue
                                result.totalScholarEarningPHP = result.totalScholarEarningSLP * this.state.slpCurrentValue;
                                // Set new total Manager SLP Earning x computed base on sharedManagerSLP multiply slpCurrentValue
                                result.totalManagerEarningPHP = result.sharedManagerSLP * this.state.slpCurrentValue;
                                // Set new total Sponsor SLP Earning x computed base on sharedSponsorSLP multiply slpCurrentValue
                                result.totalSponsorEarningPHP = result.sharedSponsorSLP * this.state.slpCurrentValue;
                            }

                            // Update value of win, lose, draw and win rate based in Battle Log
                            if(battleLogs.error === undefined) {
                                ranking.win_total = battleLogs.win_total;
                                ranking.lose_total = battleLogs.lose_total;
                                ranking.draw_total = battleLogs.draw_total;
                                ranking.win_rate = battleLogs.win_rate;
                                // Update PVP Energy left
                                result.pvp_energy = battleLogs.pvp_energy;
                            }

                            // Adding Player details and ranking in result object
                            result.details = details;
                            result.ranking = ranking;

                            // Get all ETH Address x for other display x MMR Ranking x etc
                            this.state.playerRecords.push(result);

                            // Update Player Datatable row details
                            const playerDataTableRes = {
                                name: result.name,
                                averageSLP: <MDBBox data-th={CONSTANTS.MESSAGE.AVERAGE_SLP_PERDAY_V2} tag="span">{result.averageSLPDay}</MDBBox>,
                                ingameSLP: <MDBBox data-th={CONSTANTS.MESSAGE.INGAME_SLP} tag="span">{this.numberWithCommas(result.inGameSLP)}</MDBBox>,
                                sharedScholarSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span" className="d-inline d-md-block d-lg-block">{this.numberWithCommas(result.sharedScholarSLP)} <MDBBox tag="span" className="d-inline d-md-block d-lg-block">({(details.manager).toString() === "100" ? details.manager : details.scholar}%)</MDBBox></MDBBox>,
                                roninSLP: <MDBBox data-th={CONSTANTS.MESSAGE.RONIN_SLP} tag="span" className={result.managerRoninClaimed ? "red-text" : ""}>{this.numberWithCommas(roninBalance)}</MDBBox>,
                                totalScholarEarningSLP: <MDBBox data-th={CONSTANTS.MESSAGE.TOTAL_SLP} tag="span">{this.numberWithCommas(result.totalScholarEarningSLP)}</MDBBox>,
                                totalScholarEarningPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalScholarEarningPHP).toFixed(2))}</MDBBox>,
                                claimOn: <MDBBox data-th={CONSTANTS.MESSAGE.CLAIMON} tag="span" className="d-block">{moment.unix(result.last_claimed_item_at).add(14, "days").format("MMM DD, hh:mm A")} <MDBBox tag="span" className="d-block">{result.claim_on_days} {CONSTANTS.MESSAGE.DAYS}</MDBBox></MDBBox>,
                                mmr: <MDBBox data-th={CONSTANTS.MESSAGE.MMR} tag="span" className={ranking.textStyle}>{this.numberWithCommas(ranking.elo)}</MDBBox>,
                                rank: <MDBBox data-th={CONSTANTS.MESSAGE.RANK} tag="span">{this.numberWithCommas(ranking.rank)}</MDBBox>,
                                mmrRank: <MDBBox data-th={CONSTANTS.MESSAGE.MMR} tag="span"><MDBBox tag="span" className={ranking.textStyle}>{this.numberWithCommas(ranking.elo)}</MDBBox> <MDBBox tag="span" className="d-inline d-md-block d-lg-block">({this.numberWithCommas(ranking.rank)})</MDBBox></MDBBox>,
                                sharedManagerSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span">{this.numberWithCommas(result.sharedManagerSLP)}</MDBBox>,
                                managerEarningsPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalManagerEarningPHP).toFixed(2))}</MDBBox>,
                                sharedSponsorSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span">{this.numberWithCommas(result.sharedSponsorSLP)}</MDBBox>,
                                sponsorEarningsPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">{this.numberWithCommas((result.totalSponsorEarningPHP).toFixed(2))}</MDBBox>,
                                nameMmr: `${result.name} (${ranking.elo})`,
                                nameInGameSLP: `${result.name} (${result.inGameSLP})`,
                                pvpEnergy: <MDBBox data-th={CONSTANTS.MESSAGE.PVP_ENERGY} tag="span">{result.pvp_energy}</MDBBox>,
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
                                player.win_rate = !isNaN(winRate) ? winRate.toString() === "100.00" ? "100" : winRate : "0.00"
                            }
                            // Return
                            return resolve(player);
                        }
                    }
                    return resolve({error: true});
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

    // Get Player battle log base on Game API Axie Technology
    getPlayerBattleLog = async (roninAddress, ethAddress, pvpEnergy) => {
        return new Promise((resolve, reject) => {
            const setPvpEnergy = pvpEnergy !== undefined ? pvpEnergy : 20; // 20 is Default energy
            $.ajax({
                url: "https://game-api.axie.technology/battlelog/" + roninAddress + "?limit=" + setPvpEnergy,
                dataType: "json",
                cache: false
            })
            .then(
                async (result) => {
                    if (result.length > 0 && result[0].success && result[0].items.length > 0) {
                        // Get Today Battle log only
                        let winTotal = 0, loseTotal = 0, drawTotal = 0;
                        let logsPromise = result[0].items.map(async function (logs) {
                            // Get the Client id winner today
                            const isToday = moment().isSame(moment(logs.created_at), 'date');
                            if (isToday) {
                                if (logs.winner === 0) {
                                    // 0 = Winner 1
                                    if (logs.first_client_id === ethAddress) {
                                        winTotal = winTotal + 1;
                                    } else {
                                        loseTotal = loseTotal + 1;
                                    }
                                } else if (logs.winner === 1) {
                                    // 1 = Winner 2
                                    if (logs.second_client_id === ethAddress) {
                                        winTotal = winTotal + 1;
                                    } else {
                                        loseTotal = loseTotal + 1;
                                    }
                                } else {
                                    // 2 = Draw // if (logs.winner === 2)
                                    drawTotal = drawTotal + 1;
                                }
                            }
                            
                            return true;
                        });

                        return await Promise.all(logsPromise).then(async function () {
                            const winRate = ( (winTotal / (winTotal + loseTotal + drawTotal)) * 100 ).toFixed(2);
                            const pvpEnergyLeft = setPvpEnergy - (winTotal + loseTotal + drawTotal);
                            const battleLog = {
                                win_total: winTotal,
                                lose_total: loseTotal,
                                draw_total: drawTotal,
                                win_rate: !isNaN(winRate) ? winRate.toString() === "100.00" ? "100" : winRate : "0.00",
                                pvp_energy: pvpEnergyLeft + "/" + setPvpEnergy
                            }
                            // Return
                            return resolve(battleLog);
                        });
                    }
                    return resolve({error: true});
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true})
                }
            )
            .catch(
                (err) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true});
                }
            )
        }).catch(err => {
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
                        <MDBBox tag="div" className="py-3 px-2 text-center currency-details">
                            <MDBBox tag="span">
                                {CONSTANTS.MESSAGE.PRICE_BASEON}
                                
                                {
                                    this.state.currentValueFrm === CONSTANTS.MESSAGE.BINANCE ? (
                                        <a href="https://www.binance.com/en/trade/SLP_USDT" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.BINANCE}. </a>
                                    ) : (
                                        <a href="https://www.coingecko.com/en/coins/smooth-love-potion" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.COINGECKO}. </a>
                                    )
                                }
                                
                                {CONSTANTS.MESSAGE.CURRENT_EXCHANGERATE}:
                                <MDBBox tag="span">
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
                            <MDBBox tag="div" className="py-3 px-2 text-center player-details cursor-pointer" onClick={this.modalMMRRankToggle(this.state.playerRecords)}>
                                {/* Top ELO / MMR Rank */}
                                <MDBBox tag="span" className="d-block d-md-inline d-lg-inline">{CONSTANTS.MESSAGE.TOP_MMR}: <strong>{this.state.topUserMMR}</strong></MDBBox>
                                {/* Top In Game SLP */}
                                <MDBBox tag="span" className="d-block d-md-inline d-lg-inline ml-2">{CONSTANTS.MESSAGE.TOP_INGAME_SLP}: <strong>{this.state.topUserSLP}</strong></MDBBox>
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
                            <MDBCard className="z-depth-2 player-details h-180px">
                                <MDBCardBody className="black-text cursor-pointer d-flex-center" onClick={this.modalMMRRankToggle(this.state.playerRecords)}>
                                    <MDBBox tag="div" className="text-center">
                                        {/* Top ELO / MMR Rank */}
                                        <MDBBox tag="span" className="d-block">{CONSTANTS.MESSAGE.TOP_MMR}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold"><strong>{this.state.topUserMMR}</strong></MDBBox>
                                        {/* Top In Game SLP */}
                                        <MDBBox tag="span" className="d-block mt-3">{CONSTANTS.MESSAGE.TOP_INGAME_SLP}</MDBBox>
                                        <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold"><strong>{this.state.topUserSLP}</strong></MDBBox>
                                    </MDBBox>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* Total Average SLP of all players */}
                        <MDBCol size="6" md="4" lg="2" className="my-2">
                            <MDBCard className="z-depth-2 player-details h-180px">
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
                            <MDBCard className="z-depth-2 player-details h-180px">
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
                            <MDBCard className="z-depth-2 player-details h-180px">
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
                            <MDBCard className="z-depth-2 player-details h-180px">
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
                            <MDBCard className="z-depth-2 player-details h-180px">
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
                            <MDBCol size="12">
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
                                            <MDBBox tag="span"> 
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
                                                <th colSpan="5" className="text-center font-weight-bold">{CONSTANTS.MESSAGE.MANAGER_EARNING}</th>
                                            </tr>
                                        </MDBTableHead>
                                        <MDBTableBody>
                                            {/* Total Earnings */}
                                            <tr className="text-center">
                                                <td rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{CONSTANTS.MESSAGE.TOTAL_EARNINGS}</td>
                                                <td colSpan="4" className="font-weight-bold">{CONSTANTS.MESSAGE.SLP}: {this.numberWithCommas(this.state.totalManagerAllSLP)}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td colSpan="4" className="font-weight-bold table-gray-bg"><span>&#8369; </span>{this.numberWithCommas((this.state.totalManagerAllPHP).toFixed(2))}</td>
                                            </tr>
                                            {/* Income by Categories */}
                                            <tr className="text-center">
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.BUY}</td>
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.BREED}</td>
                                                <td className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.ROI}</td>
                                                <td colSpan="2" className="font-weight-bold text-uppercase">{CONSTANTS.MESSAGE.INCOME}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td>{this.numberWithCommas((this.state.managerPHPBuy).toFixed(2))}</td>
                                                <td>{this.numberWithCommas((this.state.managerPHPBreed).toFixed(2))}</td>
                                                <td className={this.state.managerPHPReachedROI ? "green-text" : "red-text"}>{this.numberWithCommas((this.state.managerPHPROI).toFixed(2))}</td>
                                                <td>{this.numberWithCommas((this.state.managerPHPIncome).toFixed(2))}</td>
                                            </tr>
                                            {/* Earning per cash out */}
                                            <tr className="rgba-teal-strong-bg">
                                                <td colSpan="5" className="text-center font-weight-bold white-text">{CONSTANTS.MESSAGE.EARNINGS}</td>
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
                                    {this.state.modalPlayerDetails[0].name}
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
                                                        <a href={"https://marketplace.axieinfinity.com/profile/" + items.details.roninAddress + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                            {CONSTANTS.MESSAGE.OPEN_MARKETPLACE_PROFILE}
                                                        </a>
                                                    </MDBBox>
                                                    <MDBBox tag="u" className="d-none d-md-block d-lg-block text-right">
                                                        <a href={"https://marketplace.axieinfinity.com/profile/" + items.details.roninAddress + "/axie"} target="_blank" rel="noreferrer" className="black-text">
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
                                            <tr key={items.client_id} className="text-center">
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

    renderExportDataTable() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER && Object.keys(this.state.playerRecords).length > 0) {
                // return (
                    // <ExcelFile filename={CONSTANTS.MESSAGE.TEAMLOKI + "_" + moment().format("MMDDYYYY_HHmmss")} element={
                    //     <button
                    //         type="button"
                    //         className="btn btn-primary waves-effect waves-light d-none d-md-block d-lg-block export">
                    //             <MDBIcon icon="file-export" className="fa-2x" />
                    //     </button>
                    // }>
                    //     <ExcelSheet data={this.state.playerRecords} name={CONSTANTS.MESSAGE.TEAMLOKI}>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.NAME} value="name"/>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.INGAME_SLP} value="inGameSLP"/>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.MANAGER_SLP} value="sharedManagerSLP"/>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.SPONSOR_SLP} value="sharedSponsorSLP"/>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.SCHOLAR_SLP} value="sharedScholarSLP"/>
                    //         <ExcelColumn label={CONSTANTS.MESSAGE.CLAIMON} value={(col) => col.last_claimed_item_at ? moment.unix(col.last_claimed_item_at).add(14, "days").format("MMM DD, HH:MM A") : ""}/>
                    //     </ExcelSheet>
                    // </ExcelFile>
                // )
            }
        }
    }

    render() {
        document.title = CONSTANTS.MESSAGE.HOMETITLE;
        return (
            <MDBBox tag="div" className="home-wrapper">
                <MDBAnimation type="bounce" className="z-index-1 position-fixed guides-btn">
                    {/* Export Data */}
                    {this.renderExportDataTable()}

                    {/* Open Guides */}
                    <button type="button" className="btn btn-default waves-effect waves-light"
                        onClick={() => this.setState({ isLightBoxOpen: true })}>
                        <MDBIcon icon="info-circle" className="fa-3x" />
                    </button>
                </MDBAnimation>

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
                                                    entries={5}
                                                    entriesOptions={[ 5, 10, 15 ]}
                                                    className="player-datatable-container text-white"
                                                />
                                            </MDBCol>
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

                {/* Light Box */}
                {
                    this.state.isLightBoxOpen && (
                        <Lightbox
                            mainSrc={guildImages[this.state.photoIndex]}
                            nextSrc={guildImages[(this.state.photoIndex + 1) % guildImages.length]}
                            prevSrc={guildImages[(this.state.photoIndex + guildImages.length - 1) % guildImages.length]}
                            onCloseRequest={() => this.setState({ isLightBoxOpen: false })}
                            onMovePrevRequest={() =>
                                this.setState({
                                    photoIndex: (this.state.photoIndex + guildImages.length - 1) % guildImages.length,
                                })
                            }
                            onMoveNextRequest={() =>
                                this.setState({
                                    photoIndex: (this.state.photoIndex + 1) % guildImages.length,
                                })
                            }
                        />
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