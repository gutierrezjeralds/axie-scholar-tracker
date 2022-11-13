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
            slpCurrentValue: 0,
            axsCurrentValue: 0,
            currentValueFrm: CONSTANTS.MESSAGE.COINGECKO,
            apiCoinRunningCounter: 0, // 0 can be rerun another api x 1 discard the running set the default
            maxGainSLP: 200, // Max Gained SLP for validation of inserting in table
            daysClaimable: 7, // Default day set for allow slp claim
            defaultDailyQuota: 30, // Default daily quota
            managerPHPInvestment: 410000, // Estimated Investment
            isUser: this.props.user || "",
        }
    }

    componentDidMount() {
        this.pageRefresh(120000); // Refresh in 2 minutes
        this.getCoingecko();
        // this.getRecord();
        this.authLogin() // Get Access Token
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
                    currentValueFrm: CONSTANTS.MESSAGE.COINGECKO,
                    slpCurrentValue: result["smooth-love-potion"].php,
                    axsCurrentValue: result["axie-infinity"].php
                })
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
                // Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                this.setState({
                    slpCurrentValue: 0,
                    axsCurrentValue: 0
                })
            }
        )
        .catch(
            (err) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
                // Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                this.setState({
                    slpCurrentValue: 0,
                    axsCurrentValue: 0
                })
            }
        )
        .done(() => {
            // Refresh API
            this.apiRefresh();
        })
    }

    // Get Access Token
    authLogin = async () => {
        // Run api
        $.ajax({
            url: "/api/authLogin",
            type: "POST",
            data: JSON.stringify({
                "email": "vincejaspergutierrez@gmail.com",
                "password": "17df815cda847a3a2ef1c55bcf82d9f2044734576b129faf1f7a66fbda79279a"
            }),
            contentType: 'application/json',
            cache: false,
        }).then(
            async (result) => {
                console.log("authLogin", result)
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                console.error(CONSTANTS.MESSAGE.ERROR_OCCURED, err)
            }
        )
    }

    // Fetch Player Record Data
    getRecord = () => {
        $.ajax({
            url: "/api/records",
            type: "GET",
            contentType: 'application/json',
            cache: false,
        })
        .then(
            async (response) => {
                const dataRecords = response.data;
                const dataWithdraw = response.withdraw;
                const dataManagerEarned = response.managerEarned;
                const dataYesterdaySLP = response.yesterdaySLP;
                console.log("getRecord", response)
                if (dataRecords.length > 0) {
                    // Fetch player details in api of sky mavis
                    const dataResultPromise = dataRecords.map(async (item) => {
                        const isDeleted = item.DELETEIND ? item.DELETEIND : "";
                        if (isDeleted) { // To prevent fetching access token and processing for delete details
                            // End the process x Details is mark as deleted
                            return false;
                        } else {
                            // Continue process
                            let userEthAddress = null;
                            const ethAddress = item.ADDRESS ? `0x${item.ADDRESS.substring(6)}` : "";
                            const iSponsorName = item.SPONSOR_NAME ? item.SPONSOR_NAME.toLowerCase() : ""
    
                            const staticData = playerStaticData.filter(items => items.roninAddress === item.ADDRESS); // Filter valid data
                            const playersStaticData = staticData.length > 0 ? staticData[0] : undefined;
    
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
                                console.log("Running Access Token", dataRecords.length)
                                // accessToken = await GenerateAccessToken("0x8762c5505e58d70d5eb1daca967ddaaac2f10338b1355521d01a263d5640666a", item.ADDRESS, item.NAME);
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
                                // return await this.getPlayerDetails(item, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData);
                                return item;
                            } else {
                                // End the process x No Access Token
                                return false;
                            }
                        }
                    });

                    await Promise.all(dataResultPromise).then(async (results) => {
                        const dataResult = results.filter(item => item && item.error === undefined); // Filter valid data
                        console.log("dataResultPromise results", results.filter(item => item.NAME === "Vince"));
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
    getPlayerDetails = async (details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://game-api-origin.skymavis.com/v2/users/me/items/marketplace/slp",
                method: "GET",
                dataType: "json",
                cache: false,
                headers: {
                    'Authorization': 'Bearer ' + details.accessToken
                }
            })
            .then(
                async (result) => {
                    if (Object.keys(result).length > 0) { // Has player details
                        const detailProcess = await this.processPlayerDetails(result, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData);
                        return resolve(detailProcess);
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
                            const detailProcess = await this.processPlayerDetails(result, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData, true);
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
                            const detailProcess = await this.processPlayerDetails(result, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData, true);
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
    processPlayerDetails = async (inGameResult, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, dataYesterdaySLP, playersStaticData, isBasedCookie = false) => {
        return new Promise(async (resolve, reject) => {
            if (Object.keys(inGameResult).length > 0) { // Has player details
                details.inGame = inGameResult; // Insert InGame Result in Details

                // Set Player Details in LocalStorage
                localStorage.setItem(ethAddress, JSON.stringify(details));
                
                // Success return
                return resolve(details);
            } else {
                return reject({error: true});
            }
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
                                <a href="https://www.coingecko.com/en/coins/smooth-love-potion" target="_blank" rel="noreferrer"> {CONSTANTS.MESSAGE.COINGECKO}. </a>
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
                        ""
                    )
                }
            </MDBBox>
        )
    }
}

export default Home