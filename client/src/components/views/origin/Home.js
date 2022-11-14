import React from "react";
import $ from 'jquery';
// import Cookies from 'js-cookie'
import { 
    MDBBox, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody,
    MDBTable, MDBTableBody, MDBTableHead,
    MDBModal, MDBModalHeader, MDBModalBody,
    MDBDataTable, MDBIcon, MDBAnimation, MDBInput,
    MDBTabPane, MDBTabContent, MDBNav, MDBNavItem
} from "mdbreact";
import { CONSTANTS } from '../../Constants';
import playerStaticData from '../../assets/json/players.json'

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            isLoaded: false,
            currencySLP: 0,
            currencyAXS: 0,
            currencyNAME: "",
            currencyURI: "",
            apiCoinRunningCounter: 0, // 0 can be rerun another api x 1 discard the running set the default
            maxGainSLP: 200, // Max Gained SLP for validation of inserting in table
            daysClaimable: 7, // Default day set for allow slp claim
            defaultDailyQuota: 30, // Default daily quota
            managerPHPInvestment: 410000, // Estimated Investment
            isUser: this.props.user || "",
            isUserEmail: false,
            totalManagerSLP: 0,
            totalSponsorSLP: 0,
            totalScholarSLP: 0,
            totalInGameSLP: 0,
            isPlayerLoaded: false,
            playerDataTable: {},
            playerRecords: []
        }
    }

    componentDidMount() {
        this.pageRefresh(120000); // Refresh in 2 minutes
        this.getCryptoCoins();
        this.recordProcess();
        // Check if the user is valid email x for checking for display all the player data
        if (this.state.isUser) {
            const emailSplit = this.state.isUser.split('@');
            if (emailSplit.length >= 2) { // Is valid Email
                this.setState({
                    isUserEmail: true
                })
            }
        }
    }

    // Adding comma in number x replacement in toLocaleString()
    numberWithCommas = (value) => {
        if (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return value;
    }
    
    // Page reload
    pageRefresh = (time) => {
        setTimeout( () => {
            // Return
            return true;
        }, time);
    }

    // API reload
    apiRefresh = () => {
        setTimeout(() => {
            // this.getCoingecko();
        }, 5000); // Refresh in 5 seconds
    }

    // Get SLP and AXS Crypto Coins
    getCryptoCoins = () => {
        $.ajax({
            url: "/api/getCryptoCoins",
            dataType: "json",
            cache: false
        })
        .then(
            (result) => {
                if (result.error) {
                    // Has Error x Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                    this.setState({
                        currencySLP: 0,
                        currencyAXS: 0
                    })
                } else {
                    // Success fetch Crypto Coins
                    this.setState({
                        currencyNAME: result.data.NAME,
                        currencySLP: result.data.SLP,
                        currencyAXS: result.data.AXS,
                        currencyURI: result.data.URI
                    })
                }
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                // Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                this.setState({
                    currencySLP: 0,
                    currencyAXS: 0
                })
            }
        )
        .catch(
            (err) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                // Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                this.setState({
                    currencySLP: 0,
                    currencyAXS: 0
                })
            }
        )
    }

    // Get Access Token
    authLogin = async (credentials) => {
        return new Promise((resolve, reject) => {
            // Run api
            $.ajax({
                url: "/api/authLogin",
                type: "POST",
                data: JSON.stringify(credentials),
                contentType: 'application/json',
                cache: false,
            }).then(
                async (result) => {
                    if (result.error) {
                        // Has Error
                        return reject({error: true});
                    } else {
                        // Success Generate Access Token
                        try {
                            const data = result.data !== undefined && Object.keys(result.data).length > 0 ? result.data : false;
                            const token = data.accessToken ? data.accessToken : false;
                            if (token) {
                                return resolve({error: false, token: token});
                            } else {
                                return reject({error: true});
                            }
                        } catch {
                            // Has Error in parsing
                            return reject({error: true});
                        }
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true});
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

    // Process of details by fetching all data in different api
    recordProcess = () => {
        $.ajax({
            url: "/api/records",
            type: "GET",
            contentType: 'application/json',
            cache: false,
        })
        .then(
            async (response) => {
                const counter = 0; // For checking of valid process counting
                const dataRecords = response.data;
                const dataWithdraw = response.withdraw;
                const dataManagerEarned = response.managerEarned;
                // const dataYesterdaySLP = response.yesterdaySLP;
                console.log("getRecord", response)
                if (dataRecords.length > 0) {
                    // Fetch player details in api of sky mavis
                    const dataResultPromise = dataRecords.map(async (item) => {
                        const EMAIL = item.EMAIL ? item.EMAIL : false;
                        const PASS = item.PASS ? item.PASS.length > 1 ? item.PASS : false : false;
                        const isDeleted = item.DELETEIND ? item.DELETEIND : "";
                        if (isDeleted || (!EMAIL || !PASS)) { // To prevent fetching access token and processing for delete details
                            // End the process x Details is mark as deleted and No valid credentials
                            return false;
                        } else {
                            console.log(CONSTANTS.MESSAGE.PROCESS_COUNT, `${counter + 1} / ${dataRecords.length}`); // For checking of valid process counting

                            // Continue process
                            let userEthAddress = null;
                            const ethAddress = item.ADDRESS ? `0x${item.ADDRESS.substring(6)}` : "";
                            const iSponsorName = item.SPONSOR_NAME ? item.SPONSOR_NAME.toLowerCase() : ""
    
                            // Set ETH Address and Sponsor Name
                            if (item.EMAIL.toLowerCase() === this.state.isUser.toLowerCase() ||
                                item.NAME.toLowerCase() === this.state.isUser.toLowerCase() ||
                                iSponsorName === this.state.isUser.toLowerCase()) {
                                    // Get ETH Address based on Credential
                                    userEthAddress = ethAddress;
                                    if (item.SHR_SPONSOR !== "" && item.SHR_SPONSOR !== "0" && item.SHR_SPONSOR !== undefined) {
                                        // Set valid Sponsor Name
                                        this.setState({
                                            isSponsorName: this.state.isUser
                                        })
                                    }
                            }
    
                            // Get Previous data from Local Storage
                            const detailLocalStored = localStorage.getItem(ethAddress) !== null ? JSON.parse(localStorage.getItem(ethAddress)) : false;
    
                            // Process for Generate Access Token
                            let accessToken = detailLocalStored && detailLocalStored.accessToken ? detailLocalStored.accessToken : false;
                            if (accessToken) {
                                // Has already Access Token x Reassigned existing data from Local Storage
                                item = detailLocalStored;
    
                            } else { // No Access Token x Not available in Local Storage
                                // Generate Access Token
                                console.log(CONSTANTS.MESSAGE.RUN_TOKEN);
                                accessToken = await this.authLogin({email: item.EMAIL, password: item.PASS});
                                if (!accessToken.error) {
                                    // Set for Access Token
                                    item["accessToken"] = accessToken.token;
                                } else {
                                    // No Access Token x Don't display the player detail
                                    accessToken = false;
                                }
                            }
    
                            if (accessToken) { // Has Access Token
                                // Return valid details
                                return await this.getPlayerDetails(item, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                                // return item;
                            } else {
                                // End the process x No Access Token
                                return false;
                            }
                        }
                    });

                    await Promise.all(dataResultPromise).then(async (results) => {
                        let initDisplay = []; // Data for initial display

                        const dataResult = results.filter(item => item && !item.error && item.data !== undefined); // Filter valid data
                        if (dataResult && dataResult.length > 0) {
                            // Sort as Top MMR Ranking
                            dataResult.sort(function (a, b) {
                                if (a.LEADERBOARD.topRank === b.LEADERBOARD.topRank) { // equal items sort equally
                                    return 0;
                                } else if (a.LEADERBOARD.topRank === 0) { // 0 sort after anything else
                                    return 1;
                                } else if (b.LEADERBOARD.topRank === 0) { // 0 sort after anything else
                                    return -1;
                                } else {  // otherwise, if we're ascending, lowest sorts first
                                    return a.LEADERBOARD.topRank < b.LEADERBOARD.topRank ? -1 : 1;
                                }
                              }).map((dataItem, index) => {
                                const indexCount = index + 1; // Global index count
                                dataItem.data.order = indexCount; // Adding ordered number

                                // Update Name with combination of index counter x for display in data table x display for next page
                                if (indexCount > 5) {
                                    dataItem.data.nameSub = indexCount + ". " + dataItem.data.name;
                                }
    
                                // Display data
                                if (this.state.isUser === CONSTANTS.MESSAGE.MANAGER || this.state.isUserEmail) {
                                    if (!dataItem.isDelete) { // Display not deleted player
                                        initDisplay.push(dataItem.data); // Data for initial display x display all
                                    }
                                } else {
                                    if (dataItem.eth !== null) {
                                        initDisplay.push(dataItem.data); // Data for initial display x specific data to be display
                                    }
                                }
    
                                // Return
                                return true;
                            });

                            // Adding body document if the playerDataTableis single data x initDisplay
                            if (initDisplay.length <= 1) {
                                document.body.classList.add('single-player-datatable-handler');
                            }

                            // Default Columns for Player Datatable
                            let playerDataTableColums = [
                                {label: CONSTANTS.MESSAGE.NAME, field: "nameSub"},
                                {label: CONSTANTS.MESSAGE.INGAME_SLP, field: "inGameSLP"},
                                {label: CONSTANTS.MESSAGE.MINT_SLP, field: "mintSLP"},
                                {label: CONSTANTS.MESSAGE.SHARED_SLP, field: "shareSLP"},
                                {label: CONSTANTS.MESSAGE.RONIN_SLP, field: "roninSLP"},
                                {label: CONSTANTS.MESSAGE.TOTAL_SLP_PHP, field: "totalEarningPHPSLP"},
                                {label: CONSTANTS.MESSAGE.LEADERBOARD, field: "leaderboard"}
                            ];

                            // Return data x Set state
                            this.setState({
                                isLoaded: true,
                                isPlayerLoaded: true,
                                playerDataTable: {
                                    columns: playerDataTableColums,
                                    rows: initDisplay
                                }
                            })
    
                            console.log("playerRecords", this.state.playerRecords)
                        } else {
                            // No data found
                            this.setState({
                                isLoaded: true,
                                notifStr: CONSTANTS.MESSAGE.NODATA_FOUND,
                                error: true
                            })
                        }
                    })
                } else {
                    // No data found
                    this.setState({
                        isLoaded: true,
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
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                this.setState({
                    isLoaded: true,
                    error: true
                })
                    
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )
    }

    // Get Player details base on Sky Mavis API
    getPlayerDetails = async (details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/api/getInGameSLP",
                type: "POST",
                data: JSON.stringify({
                    token: details.accessToken
                }),
                contentType: 'application/json',
                cache: false
            })
            .then(
                async (result) => {
                    if (!result.error && Object.keys(result.data).length > 0) { // Has player details
                        try {
                            // Process the player details for display
                            const dataRes = result.data ? JSON.parse(result.data) : false;
                            const detailProcess = await this.processPlayerDetails(dataRes, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                            return resolve(detailProcess);
                        } catch {
                            return reject({error: true});
                        }
                    } else {
                        return reject({error: true});
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                async (error) => {
                    // Get Cookies data based on eth address
                    const detailLocalStored = localStorage.getItem(ethAddress) !== null ? localStorage.getItem(ethAddress) : false;
                    if (detailLocalStored) {
                        const result = JSON.parse(detailLocalStored); // Parse the Cookie
                        if (Object.keys(result).length > 0) { // Has player details
                            details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                            const detailsReturn = Object.assign({}, details);
                            // Process data from Local Storage
                            const detailProcess = await this.processPlayerDetails(result, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, true);
                            return resolve(detailProcess);
                        } else {
                            return reject({error: true});
                        }
                    } else {
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                        return reject({error: true});
                    }
                }
            )
            .catch(
                async (err) => {
                    const detailLocalStored = localStorage.getItem(ethAddress) !== null ? localStorage.getItem(ethAddress) : false;
                    if (detailLocalStored) {
                        const result = JSON.parse(detailLocalStored); // Parse the Cookie
                        if (Object.keys(result).length > 0) { // Has player details
                            details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                            const detailsReturn = Object.assign({}, details);
                            // Process data from Local Storage
                            const detailProcess = await this.processPlayerDetails(result, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, true);
                            return resolve(detailProcess);
                        } else {
                            return reject({error: true});
                        }
                    } else {
                        console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                        return reject({error: true});
                    }
                }
            )
        }).catch(err => {
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    // Process for Player Details result
    processPlayerDetails = async (INGAME, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, isBasedCookie = false) => {
        return new Promise(async (resolve, reject) => {
            if (Object.keys(INGAME).length > 0) { // Has player details
                // Fetch Player Wallet
                let WALLET = await this.getPlayerWallet(details);
                if (WALLET.error) {
                    // Set default object value x Get Previous Data from Local Storage
                    WALLET = details.WALLET && Object.keys(details.WALLET).length > 0 ? details.WALLET : {
                        slp: 0,
                        axs: 0,
                        ron: 0
                    }
                }

                // Fetch Player Leaderboard
                let LEADERBOARD = await this.getPlayerLeaderboard(details);
                if (LEADERBOARD.error) {
                    // Set default object value x Get Previous Data from Local Storage
                    LEADERBOARD = details.LEADERBOARD && Object.keys(details.LEADERBOARD).length > 0 ? details.LEADERBOARD : {
                        rank: "",
                        tier: 0,
                        topRank: 0,
                        vstar: 0
                    }
                }

                // Fetch Player Items (Active Runes)

                // Construct data for getting the correct computation of SLP and Balance
                if ((details.SHR_MANAGER).toString() === "100" || details.SHR_MANAGER === 100) {
                    // Set Manager Shared SLP
                    const managerShare = (details.SHR_MANAGER).toString() === "100" ? 1 : "0." + details.SHR_MANAGER;
                    details.SHAREDSLP = Math.ceil(INGAME.withdrawable * managerShare);

                    // Set Total Manager Shared SLP
                    this.setState({
                        totalManagerSLP: this.state.totalManagerSLP + details.SHAREDSLP
                    })
                } else {
                    // Set Shared Scholar/Sponsor SLP
                    if ((details.SHR_SPONSOR).toString() !== "0" || details.SHR_SPONSOR > 0) {
                        // Sponsor SLP
                        const sponsorShare = "0." + details.SHR_SPONSOR;
                        details.SHAREDSLP = Math.floor(INGAME.withdrawable * sponsorShare);

                        // Set Total Sponsor Shared SLP
                        this.setState({
                            totalSponsorSLP: this.state.totalSponsorSLP + details.SHAREDSLP
                        })
                    } else {
                        // Scholar SLP
                        const iskoShare = (details.SHR_SCHOLAR).toString() === "100" ? 1 : "0." + details.SHR_SCHOLAR;
                        details.SHAREDSLP = Math.floor(INGAME.withdrawable * iskoShare);

                        // Set Total Scholar Shared SLP
                        this.setState({
                            totalScholarSLP: this.state.totalScholarSLP + details.SHAREDSLP
                        })
                    }

                    // Set Total Manager Shared SLP
                    const managerShare = "0." + details.SHR_MANAGER;
                    this.setState({
                        totalManagerSLP: this.state.totalManagerSLP + Math.ceil(INGAME.withdrawable * managerShare)
                    })
                }

                // Set Total Earnings
                details.TOTALEARNING_SLP = parseInt(details.SHAREDSLP) + parseInt(WALLET.slp);
                details.TOTALEARNING_PHP = details.TOTALEARNING_SLP * this.state.currencySLP // Ccomputed base on TOTALEARNING_SLP multiply currencySLP

                // Construct date for dispay details
                const playerDataTableRes = {
                    name: details.NAME,
                    nameSub: details.NAME,
                    inGameSLP: <MDBBox data-th={CONSTANTS.MESSAGE.INGAME_SLP} tag="span">{this.numberWithCommas(INGAME.quantity)}</MDBBox>,
                    mintSLP: <MDBBox data-th={CONSTANTS.MESSAGE.MINT_SLP} tag="span">{this.numberWithCommas(INGAME.withdrawable)}</MDBBox>,
                    shareSLP: <MDBBox data-th={CONSTANTS.MESSAGE.SHARED_SLP} tag="span" className="d-inline d-md-block d-lg-block">
                                    <React.Fragment>
                                        {this.numberWithCommas(details.SHAREDSLP)}
                                        <MDBBox tag="span" className="d-inline d-md-block d-lg-block">
                                            ({(details.SHR_MANAGER).toString() === "100" ? details.SHR_MANAGER : details.SHR_SCHOLAR}%)
                                        </MDBBox>
                                    </React.Fragment>
                                </MDBBox>,
                    roninSLP: <MDBBox data-th={CONSTANTS.MESSAGE.RONIN_SLP} tag="span">{this.numberWithCommas(WALLET.slp)}</MDBBox>,
                    totalEarningSLP: <MDBBox data-th={CONSTANTS.MESSAGE.TOTAL_SLP} tag="span">
                                                {
                                                    this.numberWithCommas(details.TOTALEARNING_SLP)
                                                }
                                            </MDBBox>,
                    totalEarningPHP: <MDBBox data-th={CONSTANTS.MESSAGE.EARNINGS_PHP} tag="span">
                                                {
                                                    this.numberWithCommas((details.TOTALEARNING_PHP).toFixed(2))
                                                }
                                            </MDBBox>,
                    totalEarningPHPSLP: <MDBBox data-th={CONSTANTS.MESSAGE.TOTAL_SLP_PHP} tag="span">
                                            <React.Fragment>
                                                {this.numberWithCommas(details.TOTALEARNING_SLP)}
                                                <MDBBox tag="span" className="d-block">
                                                    (&#8369; {this.numberWithCommas((details.TOTALEARNING_PHP).toFixed(2))})
                                                </MDBBox>
                                            </React.Fragment>
                                        </MDBBox>,
                    rank: <MDBBox data-th={CONSTANTS.MESSAGE.RANK} tag="span">{LEADERBOARD.rank + " " + LEADERBOARD.tier}</MDBBox>,
                    topRank: <MDBBox data-th={CONSTANTS.MESSAGE.RANK} tag="span">{LEADERBOARD.topRank}</MDBBox>,
                    leaderboard: <MDBBox data-th={CONSTANTS.MESSAGE.LEADERBOARD} tag="span">{LEADERBOARD.rank + " " + LEADERBOARD.tier} <MDBBox tag="span" className="d-inline d-md-block d-lg-block">{LEADERBOARD.topRank > 0 ? ("(" + this.numberWithCommas(LEADERBOARD.topRank) + ")") : ("")}</MDBBox></MDBBox>,
                    clickEvent: ""
                };

                // Reassigned Object
                details.INGAME = INGAME; // Insert InGame Result in Details
                details.WALLET = WALLET; // Insert Wallet Result in Details
                details.LEADERBOARD = LEADERBOARD; // Insert Leaderboard Result in Details
                const detailsReturn = Object.assign({}, details);

                // Set State Object of Player Details
                this.state.playerRecords.push(detailsReturn);

                // Set Player Details in LocalStorage
                localStorage.setItem(ethAddress, JSON.stringify(detailsReturn));
                
                // Success return
                return resolve({
                    error: false,
                    data: playerDataTableRes,
                    isDelete: details.DELETEIND ? details.DELETEIND : ""
                });
            } else {
                return reject({error: true});
            }
        }).catch(err => {
            console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    // Get Player Wallet
    getPlayerWallet = async (details) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://ronin.rest/ronin/wallet/" + details.ADDRESS,
                dataType: "json",
                cache: false
            })
            .then(
                (result) => {
                    try {
                        if (result.error === undefined && Object.keys(result).length > 0) {
                            if (result.balances && Object.keys(result.balances).length > 0) {
                                // Sucess Return x Setup property key and value
                                const dataSet = {
                                    slp: result.balances.SLP.balance,
                                    axs: parseInt(result.balances.AXS.balance).toFixed(4),
                                    ron: parseInt(result.balances.RON.balance).toFixed(4)
                                }
                                return resolve(dataSet);
                            } else {
                                // Hass Error
                                return reject({error: true});
                            }
                        } else {
                            // Hass Error
                            return reject({error: true});
                        }
                    } catch {
                        return reject({error: true});
                    }
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

    // Get Player Leaderboard
    getPlayerLeaderboard = async (details) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://ronin.rest/origin/leaderboard/search?player=" + details.ADDRESS,
                dataType: "json",
                cache: false
            })
            .then(
                (res) => {
                    try {
                        if (res.result !== null && res.result !== undefined && Object.keys(res.result).length > 0) {
                            // Sucess Return
                            return resolve(res.result);
                        } else {
                            // Hass Error
                            return reject({error: true});
                        }
                    } catch {
                        return reject({error: true});
                    }
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
        if (this.state.currencySLP > 0) {
            return (
                <React.Fragment>
                    <MDBCol size="12" className="mb-3">
                        <MDBBox tag="div" className="py-3 px-2 text-center currency-details">
                            <MDBBox tag="span">
                                {CONSTANTS.MESSAGE.PRICE_BASEON}
                                <a href={this.state.currencyURI} target="_blank" rel="noreferrer"> {this.state.currencyNAME}. </a>
                                {CONSTANTS.MESSAGE.CURRENT_EXCHANGERATE}:
                                <MDBBox tag="span">
                                    <strong> 1 {CONSTANTS.MESSAGE.SLP} = {this.state.currencySLP} </strong>
                                    and
                                    <strong> 1 {CONSTANTS.MESSAGE.AXS} = {this.state.currencyAXS}</strong>
                                </MDBBox>
                            </MDBBox>
                        </MDBBox>
                    </MDBCol>
                </React.Fragment>
            )
        }
    }

    // Render Empty Detail
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
                                            <React.Fragment>
                                                {/* Display all data */}
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
                                            </React.Fragment>
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
            </MDBBox>
        )
    }
}

export default Home