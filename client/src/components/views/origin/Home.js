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
import Moment from 'react-moment';
import moments from 'moment';
import moment from 'moment-timezone';
import { APIURI, MESSAGE } from '../../Constants';

// const moment = require('moment-timezone');
const momentToday = moment().tz('Asia/Manila');
const unixMomentToday = new Date(momentToday).getTime();
console.log("Default", moments().format("YYYY-MM-DD HH:mm:ss"));
console.log("Timezone", momentToday.format("YYYY-MM-DD HH:mm:ss"));
console.log("Unix Timezone", unixMomentToday);

// Global InGame SLP Default
const _INGAMESLP = {
    "itemId": "slp",
    "quantity": 0,
    "withdrawable": 0
}

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            errorMsg: MESSAGE.UNEXPECTED_ERROR,
            isLoaded: false,
            currencySLP: 0,
            currencyAXS: 0,
            currencyNAME: "",
            currencyURI: "",
            maxGainSLP: 200, // Max Gained SLP for validation of inserting in table
            daysClaimable: 7, // Default day set for allow slp claim
            defaultDailyQuota: 30, // Default daily quota
            managerPHPInvestment: 410000, // Estimated Investment
            isUser: this.props.user || "",
            isUserEmail: false,
            isSponsorName: "",
            arrSponsorName: [],
            totalManagerClaimableSLP: 0,
            totalManagerSLP: 0,
            totalSponsorSLP: 0,
            totalScholarSLP: 0,
            totalInGameSLP: 0,
            totalAverageInGameSLP: 0,
            isPlayerLoaded: false,
            playerRecords: [],
            playerDataTable: {},
            leaderboardDatatable: {},
            topUserRank: "",
            topUserInGameSLP: "",
            isModalLeaderboardOpen: false,
            isModalManagerEarningOpen: false,
            managerEarnings: false, // Object if has data
            isModalPlayerDetailsOpen: false,
            modalPlayerDetails: [],
            isViewAxieTeam: MESSAGE.VIEW_AXIE_TEAM,
            isModalIskoInputsOpen: false,
            isValidAddTeam: 0,
            isValidWithdraw: 0,
            isValidManagerEarn: 0,
            tabIskoInputsActive: "1",
            slctClaimId: "",
            slctAddEditId: "",
            hasSponsor: false,
            isDeleted: false
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
    
    // Page reload
    pageRefresh = (time) => {
        setTimeout( () => {
            if (!this.state.isModalIskoInputsOpen) { // Dont reload when other modal is open
                return window.location.reload();
            }
            // Return
            return true;
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
        }, 5000); // Refresh in 5 seconds
    }

    // Adding comma in number x replacement in toLocaleString()
    numberWithCommas = (value) => {
        if (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return value;
    }

    // Modal Toggle for view details of Leaderboard
    modalLeaderboardToggle = () => () => {
        this.setState({
            isModalLeaderboardOpen: !this.state.isModalLeaderboardOpen
        });
    }

    // Modal Toggle for view of Manager Earning
    modalManagerEarningToggle = () => () => {
        // Open Modal Eraning from filters of "Manager"
        this.setState({
            isModalManagerEarningOpen: !this.state.isModalManagerEarningOpen
        });
    }

    // Modal Toggle for view of Players details
    modalPlayerDetailsToggle = (address, playerDetails) => async () => {
        let details = [];
        if (address && playerDetails.length > 0) {
            const findDetail = playerDetails.find(items => items.ADDRESS === address);
            if (Object.keys(findDetail).length > 0) {
                details = [findDetail];
            }
        }

        this.setState({
            isModalPlayerDetailsOpen: !this.state.isModalPlayerDetailsOpen,
            modalPlayerDetails: details,
            isViewAxieTeam: MESSAGE.VIEW_AXIE_TEAM
        });
    }

    // Hide and Show Player Earnings and Active Axie Team
    onScholarEaningNActiveTeamHandle(event) {
        if (event.target.innerText === MESSAGE.VIEW_EARNINGS) {
            this.setState({
                isViewAxieTeam: MESSAGE.VIEW_EARNINGS,
            })
        } else {
            this.setState({
                isViewAxieTeam: MESSAGE.VIEW_AXIE_TEAM,
            })
        }
    }

    // Modal Toggle for adding new team
    modalIskoInputs = () => () => {
        this.setState({
            isModalIskoInputsOpen: !this.state.isModalIskoInputsOpen
        });
    }

    // Hide and Show Manager Total Earning
    onManagerEarningHandle(event) {
        if (event.target.innerText === MESSAGE.VIEW_ALL_EARNINGS) {
            this.setState({
                isViewMangerEarning: MESSAGE.VIEW_ALL_EARNINGS,
            })
        } else {
            this.setState({
                isViewMangerEarning: MESSAGE.VIEW_CURRENT_EARNINGS,
            })
        }
    }

    // Tabs Toggle for Scholar inputs
    tabsIskoInputs = tab => e => {
        if (this.state.tabIskoInputsActive !== tab) {
            this.setState({
                tabIskoInputsActive: tab
            });
        }
    };

    // Onchange checkbox if has sponsor in add/edit modal
    handleHasSponsorCheckChange(event) {
        this.setState({
            hasSponsor: event.target.checked
        })
    }

    // Onchange checkbos if user profile is delete in add/edit modal
    handleIsDeleteCheckChange(event) {
        this.setState({
            isDeleted: event.target.checked
        })
    }

    // Handle for onchange select of Add/Edit Scholar
    handleAddEditIskoChange(event) {
        this.setState({
            slctAddEditId: event.target.value,
            hasSponsor: false,
            isDeleted: false
        })

        if (event.target.value) {
            // Update Select Option text
            // $(".addEdit-inputHolder").find("select").text(`${MESSAGE.EDIT}: ${event.target.value}`);
            const dataSet = this.state.playerRecords.filter(item => (item.ADDRESS).toString() === (event.target.value).toString() || item.NAME === event.target.value); // Filter valid data
            if (dataSet.length > 0) {
                // Check if item has sponsor
                if (Number(dataSet[0].SHR_SPONSOR) > 0) {
                    this.setState({
                        hasSponsor: true
                    })
                }
                // Check if item is delete
                if (dataSet[0].isDeleted) {
                    this.setState({
                        isDeleted: true
                    })
                }
                // Update input fields
                $(".addEdit-inputHolder input[name=ADDRESS]").val(dataSet[0].ADDRESS).attr("value", dataSet[0].ADDRESS).trigger("change").attr("disabled", "disabled");
                $(".addEdit-inputHolder input[name=NAME]").val(dataSet[0].NAME).attr("value", dataSet[0].NAME).trigger("change");
                $(".addEdit-inputHolder input[name=EMAIL]").val(dataSet[0].EMAIL).attr("value", dataSet[0].EMAIL).trigger("change")
                $(".addEdit-inputHolder input[name=PASS]").val(dataSet[0].PASS).attr("value", dataSet[0].PASS).trigger("change");;
                $(".addEdit-inputHolder input[name=SHR_MANAGER]").val(dataSet[0].SHR_MANAGER).attr("value", dataSet[0].SHR_MANAGER).trigger("change");
                $(".addEdit-inputHolder input[name=SHR_SCHOLAR]").val(dataSet[0].SHR_SCHOLAR).attr("value", dataSet[0].SHR_SCHOLAR).trigger("change");

                // Timeout the function for update the value from hidden previous
                setTimeout( () => {
                    $(".addEdit-inputHolder input[name=SHR_SPONSOR]").val(dataSet[0].SHR_SPONSOR).attr("value", dataSet[0].SHR_SPONSOR).trigger("change");
                    $(".addEdit-inputHolder input[name=SPONSOR_NAME]").val(dataSet[0].SPONSOR_NAME).attr("value", dataSet[0].SPONSOR_NAME).trigger("change");
                }, 500);
            } else {
                this.setState({
                    hasSponsor: false
                })
                // Clear data in input fields
                $(".addEdit-inputHolder input[name=ADDRESS]").val("").trigger("change").removeAttr("disabled");
                $(".addEdit-inputHolder input[name=NAME]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=EMAIL]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=PASS]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=SHR_MANAGER]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=SHR_SCHOLAR]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=SHR_SPONSOR]").val("").trigger("change");
                $(".addEdit-inputHolder input[name=SPONSOR_NAME]").val("").trigger("change");
            }
        } else {
            this.setState({
                hasSponsor: false
            })
            // Clear data in input fields
            $(".addEdit-inputHolder input[name=ADDRESS]").val("").trigger("change").removeAttr("disabled");
            $(".addEdit-inputHolder input[name=NAME]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=EMAIL]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=PASS]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=SHR_MANAGER]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=SHR_SCHOLAR]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=SHR_SPONSOR]").val("").trigger("change");
            $(".addEdit-inputHolder input[name=SPONSOR_NAME]").val("").trigger("change");
        }
    }

    // Handle for saving record
    onAddEditRecordHandle(event) {
        event.preventDefault();
        // Remove error message
        this.setState({
            isValidAddTeam: 0,
            isLoaded: false,
            isModalIskoInputsOpen: false // Close modal while processing
        })

        const shrManager = event.target.SHR_MANAGER.value ? event.target.SHR_MANAGER.value : "0";
        const shrScholar = event.target.SHR_SCHOLAR.value ? event.target.SHR_SCHOLAR.value : "0";
        const shrSponsor = event.target.SHR_SPONSOR ? event.target.SHR_SPONSOR.value ? event.target.SHR_SPONSOR.value : "0" : "0";
        const shareTotal = Number(shrManager) + Number(shrScholar) + Number(shrSponsor);
        const dateToday = momentToday.format("YYYY-MM-DD HH:mm:ss");
        if (shareTotal === 100) {
            const sponsorName = Number(shrManager) + Number(shrScholar) === 100 ? "" : event.target.SPONSOR_NAME ? event.target.SPONSOR_NAME.value ? event.target.SPONSOR_NAME.value : "" : "";
            // Continue with the process
            const datas = {
                ADDRESS: event.target.ADDRESS.value,
                NAME: event.target.NAME.value,
                EMAIL: event.target.EMAIL.value,
                PASS: event.target.PASS.value,
                SHR_MANAGER: shrManager,
                SHR_SCHOLAR: shrScholar,
                SHR_SPONSOR: shrSponsor,
                SPONSOR_NAME: sponsorName,
                STARTED_ON: dateToday,
                DELETEIND: this.state.isDeleted ? "X" : "",
                ACTION: this.state.slctAddEditId ? MESSAGE.UPDATE : MESSAGE.INSERT // Empty addEdit id from select will be insert
            }

            // Run Ajax
            $.ajax({
                url: APIURI + "addEditScholar",
                type: "POST",
                data: JSON.stringify(datas),
                contentType: 'application/json',
                cache: false,
            }).then(
                async (result) => {
                    // Return
                    if (!result.error) {
                        // Sucess response x reload the page
                        window.location.reload();
                    } else {
                        // Has error
                        this.setState({
                            isValidAddTeam: false,
                            errorMsg: MESSAGE.UNEXPECTED_ERROR,
                            isLoaded: true,
                            isModalIskoInputsOpen: true // Open modal after processing with error
                        })
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    this.setState({
                        isValidAddTeam: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    this.setState({
                        isValidAddTeam: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
        } else {
            // Invalid total of Share
            this.setState({
                isValidAddTeam: false,
                errorMsg: MESSAGE.SHARELIMIT,
                isLoaded: true,
                isModalIskoInputsOpen: true // Open modal after processing with error
            })
        }
    }

    // Handle for Select Change in Claim Tab
    handleClaimChange(event) {
        this.setState({
            slctClaimId: event.target.value
        })

        // Update SLP Currency input value
        $(".claim-inputHolder input[name=SLPCURRENCY]").val(this.state.currencySLP).attr("value", this.state.currencySLP).trigger("change");
        // Continue with the process
        if (event.target.value) {
            const dataSet = this.state.playerRecords.filter(item => (item.ADDRESS).toString() === (event.target.value).toString() || item.NAME === event.target.value); // Filter valid data
            if (dataSet.length > 0) {
                // Update input fields
                $(".claim-inputHolder input[name=ADDRESS]").val(dataSet[0].ADDRESS).attr("value", dataSet[0].ADDRESS).trigger("change").siblings('label').addClass('active');
                $(".claim-inputHolder input[name=SLPTOTAL]").val(dataSet[0].SHAREDSLP).attr("value", dataSet[0].SHAREDSLP).trigger("change");
                // Enable Button Submit
                $(".claim-inputHolder button").removeAttr("disabled");
            } else {
                // Clear data in input fields
                $(".claim-inputHolder input[name=ADDRESS]").val("").trigger("change").siblings('label').removeClass('active');
                $(".claim-inputHolder input[name=SLPTOTAL]").val("").trigger("change");
                // Disabled Button Submit
                $(".claim-inputHolder button").attr("disabled", "disabled");
            }
        } else {
            // Clear data in input fields
            $(".claim-inputHolder input[name=ADDRESS]").val("").trigger("change");
            $(".claim-inputHolder input[name=SLPTOTAL]").val("").trigger("change");
            // Disabled Button Submit
            $(".claim-inputHolder button").attr("disabled", "disabled");
        }
    }

    // Handle for saving withdraw slp
    onWithdrawHandle(event) {
        event.preventDefault();
        // Remove error message
        this.setState({
            isValidWithdraw: 0,
            isLoaded: false,
            isModalIskoInputsOpen: false // Close modal while processing
        })

        const roninAddress = event.target.ADDRESS.value ? event.target.ADDRESS.value : "";
        const slpTotal = event.target.SLPTOTAL.value ? event.target.SLPTOTAL.value : "0";
        const slpCurrency = Number(event.target.SLPCURRENCY.value) && Number(event.target.SLPCURRENCY.value) !== 0 ? event.target.SLPCURRENCY.value : this.state.currencySLP;
        const withdrawOn = event.target.WITHDRAW_ON.value ? moment(event.target.WITHDRAW_ON.value).format("YYYY-MM-DD HH:mm:ss") : momentToday.format("YYYY-MM-DD HH:mm:ss");
        if ((Number(slpTotal) > 0) && roninAddress) {
            // Continue with the process
            const datas = {
                ADDRESS: roninAddress,
                SLPTOTAL: slpTotal,
                SLPCURRENCY: slpCurrency,
                WITHDRAW_ON: withdrawOn
            }

            // Run api
            $.ajax({
                url: APIURI + "withdraw",
                type: "POST",
                data: JSON.stringify(datas),
                contentType: 'application/json',
                cache: false,
            }).then(
                async (result) => {
                    // Return
                    if (!result.error) {
                        // Sucess response x reload the page
                        window.location.reload();
                    } else {
                        // Has error
                        this.setState({
                            isValidWithdraw: false,
                            errorMsg: MESSAGE.UNEXPECTED_ERROR,
                            isLoaded: true,
                            isModalIskoInputsOpen: true // Open modal after processing with error
                        })
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    // Has error
                    this.setState({
                        isValidWithdraw: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    // Has error
                    this.setState({
                        isValidWithdraw: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
        } else {
            // Invalid data
            this.setState({
                isValidAddTeam: false,
                errorMsg: MESSAGE.UNEXPECTED_ERROR,
                isLoaded: true,
                isModalIskoInputsOpen: true // Open modal after processing with error
            })
        }
    }

    // Handle for saving manager earnings
    onManagerEarnedHandle(event) {
        event.preventDefault();
        // Remove error message
        this.setState({
            isValidManagerEarn: 0,
            isLoaded: false,
            isModalIskoInputsOpen: false // Close modal while processing
        })

        const slpTotal = event.target.SLPTOTAL.value ? event.target.SLPTOTAL.value : "0";
        const slpCurrency = Number(event.target.SLPCURRENCY.value) && Number(event.target.SLPCURRENCY.value) !== 0 ? event.target.SLPCURRENCY.value : this.state.currencySLP;
        const category = $(".managerEarn-inputHolder").find("select option:selected").text();
        const earnedOn = event.target.EARNED_ON.value ? moment(event.target.EARNED_ON.value).format("YYYY-MM-DD HH:mm:ss") : momentToday.format("YYYY-MM-DD HH:mm:ss");
        if (Number(slpTotal) > 0 && Number(slpCurrency) > 0 && category) {
            // Continue with the process
            const datas = {
                SLPTOTAL: slpTotal,
                SLPCURRENCY: slpCurrency,
                CATEGORY: category,
                EARNED_ON: earnedOn
            }
                
            // Run api
            $.ajax({
                url: APIURI + "managerEarned",
                type: "POST",
                data: JSON.stringify(datas),
                contentType: 'application/json',
                cache: false,
            }).then(
                async (result) => {
                    // Return
                    if (!result.error) {
                        // Sucess response x reload the page
                        window.location.reload();
                    } else {
                        // Has error
                        this.setState({
                            isValidManagerEarn: false,
                            errorMsg: MESSAGE.UNEXPECTED_ERROR,
                            isLoaded: true,
                            isModalIskoInputsOpen: true // Open modal after processing with error
                        })
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    // Has error
                    this.setState({
                        isValidManagerEarn: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    // Has error
                    this.setState({
                        isValidManagerEarn: false,
                        errorMsg: MESSAGE.UNEXPECTED_ERROR,
                        isLoaded: true,
                        isModalIskoInputsOpen: true // Open modal after processing with error
                    })
                }
            )
        } else {
            // Invalid data
            this.setState({
                isValidAddTeam: false,
                errorMsg: MESSAGE.UNEXPECTED_ERROR,
                isLoaded: true,
                isModalIskoInputsOpen: true // Open modal after processing with error
            })
        }
    }

    // Get SLP and AXS Crypto Coins
    getCryptoCoins = () => {
        $.ajax({
            url: APIURI + "getCryptoCoins",
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
                console.error(MESSAGE.ERROR_OCCURED, error)
                // Set the default value of SLP and AXS into 0 x error in fetching data from third party api
                this.setState({
                    currencySLP: 0,
                    currencyAXS: 0
                })
            }
        )
        .catch(
            (err) => {
                console.error(MESSAGE.ERROR_OCCURED, err)
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
                url: APIURI + "authLogin",
                type: "POST",
                data: JSON.stringify(credentials),
                contentType: 'application/json',
                cache: false,
            }).then(
                async (result) => {
                    if (result.error) {
                        // Has Error
                        return reject({error: true, category: "authLogin"});
                    } else {
                        // Success Generate Access Token
                        try {
                            const data = result.data !== undefined && Object.keys(result.data).length > 0 ? result.data : false;
                            const token = data.accessToken ? data.accessToken : false;
                            if (token) {
                                return resolve({error: false, token: token});
                            } else {
                                return reject({error: true, category: "authLogin"});
                            }
                        } catch (error) {
                            // Has Error in parsing
                            return reject({error: true, data: error, category: "authLogin"});
                        }
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true, data: error, category: "authLogin"});
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true, data: err, category: "authLogin"});
                }
            )
        }).catch(err => {
            console.error(MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    // Process of details by fetching all data in different api
    recordProcess = () => {
        $.ajax({
            url: APIURI + "records",
            type: "GET",
            contentType: 'application/json',
            cache: false,
        })
        .then(
            async (response) => {
                let counter = 0; // For checking of valid process counting
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

                        counter = counter + 1;
                        // console.log(MESSAGE.PROCESS_COUNT, `${counter} / ${dataRecords.length}`); // For checking of valid process counting

                        // Continue process
                        let userEthAddress = null;
                        const ethAddress = item.ADDRESS ? `0x${item.ADDRESS.substring(6)}` : "";
                        const isSponsorName = item.SPONSOR_NAME ? item.SPONSOR_NAME.toLowerCase() : ""

                        // Set Array of Sponsors
                        if (isSponsorName) {
                            this.state.arrSponsorName.push(isSponsorName);
                        }

                        // Set ETH Address and Sponsor Name
                        if (item.EMAIL.toLowerCase() === this.state.isUser.toLowerCase() ||
                            item.NAME.toLowerCase() === this.state.isUser.toLowerCase() ||
                            isSponsorName === this.state.isUser.toLowerCase()) {
                                // Get ETH Address based on Credential
                                userEthAddress = ethAddress;
                                if (item.SHR_SPONSOR !== "" && item.SHR_SPONSOR !== "0" && item.SHR_SPONSOR !== undefined) {
                                    // Set valid Sponsor Name
                                    this.setState({
                                        isSponsorName: this.state.isUser
                                    })
                                }
                        }

                        if (isDeleted || (!EMAIL || !PASS)) { // To prevent fetching access token and processing for delete details
                            // Details is mark as deleted and No valid credentials
                            // Continue Process for Player Details with Default/Empty data of InGame SLP
                            item["accessToken"] = false; // Update the Access Token property value to empty for resetting in generate token
                            return await this.processPlayerDetails(_INGAMESLP, counter, item, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);

                        } else {
                            // Get Previous data from Local Storage
                            const detailLocalStored = localStorage.getItem(ethAddress) !== null ? JSON.parse(localStorage.getItem(ethAddress)) : false;

                            // Process for Generate Access Token
                            let accessToken = detailLocalStored && detailLocalStored.accessToken ? detailLocalStored.accessToken : false;
                            if (accessToken) {
                                // Has already Access Token x Reassigned existing data from Local Storage
                                item = detailLocalStored;

                            } else { // No Access Token x Not available in Local Storage
                                // Generate Access Token
                                console.log(`${MESSAGE.RUN_TOKEN}:`, item.NAME);
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
                                return await this.getPlayerDetails(item, counter, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                                // return item;
                            } else {
                                // End the process x No Access Token
                                return false;
                            }
                        }
                    });

                    await Promise.all(dataResultPromise).then(async (results) => {
                        let initDisplay = []; // Data for initial display
                        let leaderboardDisplay = []; // Data for players leaderboard list display in Modal

                        const dataResult = results.filter(item => item && !item.error && item.data !== undefined && item.eth !== undefined); // Filter valid data
                        if (dataResult && dataResult.length > 0) {
                            // Sort as Top Leaderboard
                            dataResult.sort(function (a, b) {
                                if (a.topRank === b.topRank) { // equal items sort equally
                                    return 0;
                                } else if (a.topRank === 0) { // 0 sort after anything else
                                    return 1;
                                } else if (b.topRank === 0) { // 0 sort after anything else
                                    return -1;
                                } else {  // otherwise, if we're ascending, lowest sorts first
                                    return a.topRank < b.topRank ? -1 : 1;
                                }
                              }).map((dataItem, index) => {
                                const indexCount = index + 1; // Global index count
                                dataItem.data.order = indexCount; // Adding ordered number

                                // Get Top MMR Player
                                if (indexCount === 1) {
                                    this.setState({
                                        topUserRank: dataItem.nameTopRank ? dataItem.nameTopRank : ""
                                    })
                                }

                                // Update Name with combination of index counter x for display in data table x display for next page
                                if (indexCount > 5) {
                                    dataItem.data.nameSub = indexCount + ". " + dataItem.data.name;
                                }
    
                                // Display data
                                if (this.state.isUser === MESSAGE.MANAGER || this.state.isUserEmail) {
                                    if (!dataItem.isDelete) { // Display not deleted player
                                        initDisplay.push(dataItem.data); // Data for initial display x display all
                                    }
                                } else {
                                    if (dataItem.eth !== null) {
                                        initDisplay.push(dataItem.data); // Data for initial display x specific data to be display
                                    }
                                }

                                // Data for players MMR list display in Modal x Pushed specific data
                                if (!dataItem.isDelete) { // Display not deleted player
                                    leaderboardDisplay.push({
                                        order: dataItem.data.order,
                                        name: dataItem.data.name,
                                        rank: dataItem.data.rank,
                                        topRank: dataItem.data.topRank
                                    });
                                }
    
                                // Return
                                return true;
                            });

                            // Sort as Top SLP Gainer
                            dataResult.sort((a, b) =>  b.inGameSLP - a.inGameSLP ).map((dataItem, index) => {
                                dataItem.data.order = index + 1; // Adding ordered number
    
                                // Get Top InGame SLP Player
                                if (dataItem.data.order === 1) {
                                    this.setState({
                                        topUserInGameSLP: dataItem.nameTopInGameSLP ? dataItem.nameTopInGameSLP : ""
                                    })
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
                                {label: MESSAGE.NAME, field: "nameSub"},
                                {label: MESSAGE.INGAME_SLP, field: "inGameSLP"},
                                {label: MESSAGE.MINT_SLP, field: "mintSLP"},
                                {label: MESSAGE.SHARED_SLP, field: "shareSLP"},
                                {label: MESSAGE.RONIN_SLP, field: "roninSLP"},
                                {label: MESSAGE.TOTAL_SLP_PHP, field: "totalEarningPHPSLP"},
                                {label: MESSAGE.LEADERBOARD, field: "leaderboard"}
                            ];

                            // Return data x Set state
                            this.setState({
                                error: false,
                                isLoaded: true,
                                isPlayerLoaded: true,
                                playerDataTable: {
                                    columns: playerDataTableColums,
                                    rows: initDisplay
                                },
                                leaderboardDatatable: {
                                    columns: [
                                        {label: "", field: "order"},
                                        {label: MESSAGE.NAME, field: "name"},
                                        {label: MESSAGE.RANK, field: "rank"},
                                        {label: MESSAGE.LEADERBOARD, field: "topRank", sort: "desc"}
                                    ], rows: leaderboardDisplay
                                },
                            })
    
                            console.log("playerRecords", this.state.playerRecords)
                        } else {
                            // No data found
                            this.setState({
                                isLoaded: true,
                                notifStr: MESSAGE.NODATA_FOUND,
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
                    
                console.error(MESSAGE.ERROR_OCCURED, error)
            }
        )
        .catch(
            (err) => {
                this.setState({
                    isLoaded: true,
                    error: true
                })
                    
                console.error(MESSAGE.ERROR_OCCURED, err)
            }
        )
    }

    // Get Player details base on Sky Mavis API
    getPlayerDetails = async (details, detailsLength, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: APIURI + "getInGameSLP",
                type: "POST",
                data: JSON.stringify({
                    token: details.accessToken,
                    name: details.NAME
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
                            const detailProcess = await this.processPlayerDetails(dataRes, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                            return resolve(detailProcess);
                        } catch {
                            // Continue Process for Player Details with Default/Empty data of InGame SLP
                            details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                            const detailsReturn = Object.assign({}, details);
                            const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                            return resolve(detailProcess);
                        }
                    } else {
                        // Continue Process for Player Details with Default/Empty data of InGame SLP
                        details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                        const detailsReturn = Object.assign({}, details);
                        const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                        return resolve(detailProcess);
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                async (error) => {
                    // Get Cookies data based on eth address
                    const detailLocalStored = localStorage.getItem(ethAddress) !== null ? localStorage.getItem(ethAddress) : false;
                    if (detailLocalStored) {
                        const dataRes = JSON.parse(detailLocalStored); // Parse the Cookie
                        if (Object.keys(dataRes).length > 0) { // Has player details
                            details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                            const detailsReturn = Object.assign({}, details);
                            // Process data from Local Storage
                            const detailProcess = await this.processPlayerDetails(dataRes, detailsLength, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, true);
                            return resolve(detailProcess);
                        } else {
                            // Continue Process for Player Details with Default/Empty data of InGame SLP
                            const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                            return resolve(detailProcess);
                        }
                    } else {
                        console.error(MESSAGE.ERROR_OCCURED, error)
                        // Continue Process for Player Details with Default/Empty data of InGame SLP
                        const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                        return resolve(detailProcess);
                    }
                }
            )
            .catch(
                async (err) => {
                    const detailLocalStored = localStorage.getItem(ethAddress) !== null ? localStorage.getItem(ethAddress) : false;
                    if (detailLocalStored) {
                        const dataRes = JSON.parse(detailLocalStored); // Parse the Cookie
                        if (Object.keys(dataRes).length > 0) { // Has player details
                            details.accessToken = false; // Update the Access Token property value to empty for resetting in generate token
                            const detailsReturn = Object.assign({}, details);
                            // Process data from Local Storage
                            const detailProcess = await this.processPlayerDetails(dataRes, detailsLength, detailsReturn, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, true);
                            return resolve(detailProcess);
                        } else {
                            // Continue Process for Player Details with Default/Empty data of InGame SLP
                            const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                            return resolve(detailProcess);
                        }
                    } else {
                        console.error(MESSAGE.ERROR_OCCURED, err)
                        // Continue Process for Player Details with Default/Empty data of InGame SLP
                        const detailProcess = await this.processPlayerDetails(_INGAMESLP, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned);
                        return resolve(detailProcess);
                    }
                }
            )
        }).catch(err => {
            console.error(MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    // Process for Player Details result
    processPlayerDetails = async (INGAME, detailsLength, details, ethAddress, userEthAddress, dataWithdraw, dataManagerEarned, isBasedCookie = false) => {
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
                        totalManagerClaimableSLP: this.state.totalManagerClaimableSLP + details.SHAREDSLP + Number(WALLET.slp),
                        totalManagerSLP: this.state.totalManagerSLP + details.SHAREDSLP
                    })
                } else {
                    let totalSponsorSLPRes = 0;
                    // Set Shared Scholar/Sponsor SLP
                    if ((details.SHR_SPONSOR).toString() !== "0" || details.SHR_SPONSOR > 0) {
                        // Sponsor SLP
                        const sponsorShare = "0." + details.SHR_SPONSOR;
                        details.SHAREDSLP = Math.floor(INGAME.withdrawable * sponsorShare);

                        // Set Total Sponsor Shared SLP
                        totalSponsorSLPRes = this.state.totalSponsorSLP + details.SHAREDSLP;
                        this.setState({
                            totalSponsorSLP: totalSponsorSLPRes
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
                        totalManagerClaimableSLP: this.state.totalManagerClaimableSLP + details.SHAREDSLP,
                        totalManagerSLP: this.state.totalManagerSLP + Math.ceil(INGAME.withdrawable * managerShare)
                    })

                    // Set Total Sponsor Shared SLP with Ronin of Sponsor
                    if (this.state.arrSponsorName.includes((details.NAME).toLowerCase())) {
                        this.setState({
                            totalSponsorSLP: totalSponsorSLPRes + Number(WALLET.slp)
                        })
                    }
                }

                // Default property key/value for Manager Earning
                details.MANAGEREARNING = {
                    TOTAL: {
                        ROI: 0,
                        INCOME: 0,
                        BREED: 0,
                        BUY: 0,
                        SLP: 0,
                        PHP: 0
                    },
                    CLAIMED: [],
                    REACHEDROI: false, // For validation if ROI is completed
                };

                // Construct data for Manager All Income and Set value for Total Earning per claimed
                if ((details.SHR_MANAGER).toString() === "100" && (dataManagerEarned !== undefined && dataManagerEarned.length > 0)) {
                    dataManagerEarned.map((data, idx) => {
                        // Adding PHP Earning
                        data.PHPTOTAL = Number(data.SLPTOTAL) * Number(data.SLPCURRENCY);
                        // Update Total Income and SLP
                        details.MANAGEREARNING.TOTAL.SLP = Number(details.MANAGEREARNING.TOTAL.SLP) + Number(data.SLPTOTAL);
                        details.MANAGEREARNING.TOTAL.PHP = Number(details.MANAGEREARNING.TOTAL.PHP) + Number(data.PHPTOTAL);

                        if (data.CATEGORY && (data.CATEGORY.toLowerCase()) === "withdraw") {
                            if (!details.MANAGEREARNING.REACHEDROI) {
                                // Adding Return of Investment
                                details.MANAGEREARNING.TOTAL.ROI = Number(details.MANAGEREARNING.TOTAL.ROI) + Number(data.PHPTOTAL);

                                // Reached the ROI
                                if (Number(details.MANAGEREARNING.TOTAL.ROI) >= Number(this.state.managerPHPInvestment)) {
                                    details.MANAGEREARNING.REACHEDROI = true;
                                }
                            } else {
                                // Adding total of Income
                                details.MANAGEREARNING.TOTAL.INCOME = Number(details.MANAGEREARNING.TOTAL.INCOME) + Number(data.PHPTOTAL);
                            }
                        }

                        if (data.CATEGORY && (data.CATEGORY.toLowerCase()) === "breed") {
                            // Adding total cost for breeding
                            details.MANAGEREARNING.TOTAL.BREED = Number(details.MANAGEREARNING.TOTAL.BREED) + Number(data.PHPTOTAL);
                        }

                        if (data.CATEGORY && (data.CATEGORY.toLowerCase()) === "buy") {
                            // Adding total cost for buying axie
                            details.MANAGEREARNING.TOTAL.BUY = Number(details.MANAGEREARNING.TOTAL.BUY) + Number(data.PHPTOTAL);
                        }

                        // Push data
                        data.INDEX = idx;
                        let managerData = Object.assign({}, data);
                        details.MANAGEREARNING.CLAIMED.push(managerData);

                        // Return
                        return true;
                    })

                    // Update Data for Manager All Earning
                    this.setState({
                        managerEarnings: details.MANAGEREARNING
                    })
                }

                // Default property key/value for Schoalr Withdraw
                details.WITHDRAWEARNING = {
                    TOTALINCOME: 0,
                    CLAIMED: []
                }

                // Set new value for Team Total Income and Total Earning per withdraw
                if (dataWithdraw !== undefined && dataWithdraw.length > 0) {
                    // Get specific data based on ronin address in dataWithdraw
                    dataWithdraw.filter(item => item.ADDRESS === details.ADDRESS).map((data, idx) => {
                        // Adding PHP Earning
                        data.PHPTOTAL = Number(data.SLPTOTAL) * Number(data.SLPCURRENCY);

                        // Update Total Income
                        details.WITHDRAWEARNING.TOTALINCOME = details.WITHDRAWEARNING.TOTALINCOME + data.PHPTOTAL;

                        // Push data
                        data.INDEX = idx;
                        let withdrawData = Object.assign({}, data);
                        details.WITHDRAWEARNING.CLAIMED.push(withdrawData);

                        // Return
                        return true;

                    });
                }

                // Set Total InGame SLP x Average InGame SLP
                const totalIngameSLPRes = this.state.totalInGameSLP + INGAME.quantity;
                this.setState({
                    totalInGameSLP: totalIngameSLPRes,
                    totalAverageInGameSLP: Number(totalIngameSLPRes) / Number(detailsLength)
                })

                // Set Total Earnings
                details.TOTALEARNING_SLP = Number(details.SHAREDSLP) + Number(WALLET.slp);
                details.TOTALEARNING_PHP = details.TOTALEARNING_SLP * this.state.currencySLP // Ccomputed base on TOTALEARNING_SLP multiply currencySLP
                
                // Reassigned Object
                details.INGAME = INGAME; // Insert InGame Result in Details
                details.WALLET = WALLET; // Insert Wallet Result in Details
                details.LEADERBOARD = LEADERBOARD; // Insert Leaderboard Result in Details
                const PLAYER = Object.assign({}, details);

                // Set State Object of Player Details
                this.state.playerRecords.push(PLAYER);

                // Set Player Details in LocalStorage
                localStorage.setItem(ethAddress, JSON.stringify(PLAYER));

                // Construct date for dispay details
                const playerDataTableRes = {
                    name: PLAYER.NAME,
                    nameSub: PLAYER.NAME,
                    inGameSLP: <MDBBox data-th={MESSAGE.INGAME_SLP} tag="span">{this.numberWithCommas(PLAYER.INGAME.quantity)}</MDBBox>,
                    mintSLP: <MDBBox data-th={MESSAGE.MINT_SLP} tag="span">
                                    {
                                        this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                            this.numberWithCommas(PLAYER.INGAME.withdrawable)
                                        ) : (0) // If user is email x display 0 for other player
                                    }
                                </MDBBox>,
                    shareSLP: <MDBBox data-th={MESSAGE.SHARED_SLP} tag="span" className="d-inline d-md-block d-lg-block">
                                    {
                                        this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                            <React.Fragment>
                                                {this.numberWithCommas(PLAYER.SHAREDSLP)}
                                                <MDBBox tag="span" className="d-inline d-md-block d-lg-block">
                                                    ({(PLAYER.SHR_MANAGER).toString() === "100" ? PLAYER.SHR_MANAGER : PLAYER.SHR_SCHOLAR}%)
                                                </MDBBox>
                                            </React.Fragment>
                                        ) : (0) // If user is email x display 0 for other player
                                    }
                                </MDBBox>,
                    roninSLP: <MDBBox data-th={MESSAGE.RONIN_SLP} tag="span">
                                    {
                                        this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                            this.numberWithCommas(PLAYER.WALLET.slp)
                                        ) : (0) // If user is email x display 0 for other player
                                    }
                                </MDBBox>,
                    totalEarningSLP: <MDBBox data-th={MESSAGE.TOTAL_SLP} tag="span">
                                        {
                                            this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                                this.numberWithCommas(PLAYER.TOTALEARNING_SLP)
                                            ) : (0) // If user is email x display 0 for other player
                                        }
                                    </MDBBox>,
                    totalEarningPHP: <MDBBox data-th={MESSAGE.EARNINGS_PHP} tag="span">
                                        {
                                            this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                                this.numberWithCommas((PLAYER.TOTALEARNING_PHP).toFixed(2))
                                            ) : (0) // If user is email x display 0 for other player
                                        }
                                    </MDBBox>,
                    totalEarningPHPSLP: <MDBBox data-th={MESSAGE.TOTAL_SLP_PHP} tag="span">
                                            {
                                                this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (PLAYER.EMAIL).toLowerCase() ? (
                                                    <React.Fragment>
                                                        {this.numberWithCommas(PLAYER.TOTALEARNING_SLP)}
                                                        <MDBBox tag="span" className="d-block">
                                                            (&#8369; {this.numberWithCommas((PLAYER.TOTALEARNING_PHP).toFixed(2))})
                                                        </MDBBox>
                                                    </React.Fragment>
                                                ) : (0) // If user is email x display 0 for other player
                                            }
                                        </MDBBox>,
                    rank: <MDBBox data-th={MESSAGE.RANK} tag="span">{PLAYER.LEADERBOARD.rank + " " + PLAYER.LEADERBOARD.tier}</MDBBox>,
                    topRank: <MDBBox data-th={MESSAGE.RANK} tag="span">{this.numberWithCommas(PLAYER.LEADERBOARD.topRank)}</MDBBox>,
                    leaderboard: <MDBBox data-th={MESSAGE.LEADERBOARD} tag="span">{PLAYER.LEADERBOARD.rank + " " + PLAYER.LEADERBOARD.tier} <MDBBox tag="span" className="d-inline d-md-block d-lg-block">{PLAYER.LEADERBOARD.topRank > 0 ? ("(" + this.numberWithCommas(PLAYER.LEADERBOARD.topRank) + ")") : ("")}</MDBBox></MDBBox>,
                    clickEvent: this.modalPlayerDetailsToggle(PLAYER.ADDRESS, [PLAYER])
                };
                
                // Success return
                return resolve({
                    error: false,
                    data: playerDataTableRes,
                    inGameSLP: PLAYER.INGAME.quantity,
                    topRank: PLAYER.LEADERBOARD.topRank,
                    nameTopRank: `${PLAYER.NAME} (${PLAYER.LEADERBOARD.rank} ${PLAYER.LEADERBOARD.tier})`,
                    nameTopInGameSLP: `${PLAYER.NAME} (${PLAYER.INGAME.quantity})`,
                    eth: userEthAddress,
                    isDelete: PLAYER.DELETEIND ? PLAYER.DELETEIND : ""
                });
            } else {
                return reject({error: true, category: "processPlayerDetails"});
            }
        }).catch(err => {
            console.error(MESSAGE.ERROR_OCCURED, err)
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
                                    slp: (result.balances.SLP.balance).length <= 6 ? result.balances.SLP.balance : 0,
                                    axs: Number(result.balances.AXS.balance).toFixed(4),
                                    ron: Number(result.balances.RON.balance).toFixed(4)
                                }
                                return resolve(dataSet);
                            } else {
                                // Hass Error
                                return reject({error: true, category: "getPlayerWallet"});
                            }
                        } else {
                            // Hass Error
                            return reject({error: true, category: "getPlayerWallet"});
                        }
                    } catch (error) {
                        return reject({error: true, data: error, category: "getPlayerWallet"});
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true, data: error, category: "getPlayerWallet"})
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true, data: err, category: "getPlayerWallet"});
                }
            )
        }).catch(err => {
            console.error(MESSAGE.ERROR_OCCURED, err)
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
                            return reject({error: true, category: "getPlayerLeaderboard"});
                        }
                    } catch (error) {
                        return reject({error: true, data: error, category: "getPlayerLeaderboard"});
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.error(MESSAGE.ERROR_OCCURED, error)
                    return reject({error: true, data: error, category: "getPlayerLeaderboard"})
                }
            )
            .catch(
                (err) => {
                    console.error(MESSAGE.ERROR_OCCURED, err)
                    return reject({error: true, data: err, category: "getPlayerLeaderboard"});
                }
            )
        }).catch(err => {
            console.error(MESSAGE.ERROR_OCCURED, err)
            return err;
        });
    }

    // Render Crypto Currency details
    renderCurrencies() {
        if (this.state.currencySLP > 0) {
            return (
                <React.Fragment>
                    <MDBCol size="12" className="mb-3">
                        <MDBBox tag="div" className="py-3 px-2 text-center currency-details">
                            <MDBBox tag="span">
                                {MESSAGE.PRICE_BASEON}
                                <a href={this.state.currencyURI} target="_blank" rel="noreferrer"> {this.state.currencyNAME}. </a>
                                {MESSAGE.CURRENT_EXCHANGERATE}:
                                <MDBBox tag="span">
                                    <strong> 1 {MESSAGE.SLP} = {this.state.currencySLP} </strong>
                                    and
                                    <strong> 1 {MESSAGE.AXS} = {this.state.currencyAXS}</strong>
                                </MDBBox>
                            </MDBBox>
                        </MDBBox>
                    </MDBCol>
                </React.Fragment>
            )
        }
    }

    // Render Total Earnings of Manager, Scholar and Sponsor and other details
    renderSubDetails() {
        if ( this.state.isPlayerLoaded && this.state.isLoaded && !this.state.error ) {
            return (
                <React.Fragment>
                    {this.state.isUser === MESSAGE.MANAGER || this.state.isUserEmail ? (
                        <React.Fragment>
                            {/* Top MMR and SLP */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody className="black-text cursor-pointer d-flex-center" onClick={this.modalLeaderboardToggle()}>
                                        <MDBBox tag="div" className="text-center">
                                            {/* Top Leaderboard */}
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOP_MMR}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold"><strong>{this.state.topUserRank}</strong></MDBBox>
                                            {/* Top In Game SLP */}
                                            <MDBBox tag="span" className="d-block mt-3">{MESSAGE.TOP_INGAME_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1rem font-weight-bold"><strong>{this.state.topUserInGameSLP}</strong></MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>

                            {/* Total Average SLP of all players */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody className="black-text d-flex-center">
                                        <MDBBox tag="div" className="text-center">
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOTAL_AVERAGE_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                {this.numberWithCommas(Math.floor(this.state.totalAverageInGameSLP))}
                                            </MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((Number(this.state.totalAverageInGameSLP) * Number(this.state.currencySLP)).toFixed(2))}</MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>

                            {/* Total InGame SLP */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody className="black-text d-flex-center">
                                        <MDBBox tag="div" className="text-center">
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOTAL_INGAME_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                {this.numberWithCommas(this.state.totalInGameSLP)}
                                            </MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((Number(this.state.totalInGameSLP) * Number(this.state.currencySLP)).toFixed(2))}</MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
        
                            {/* Total Scholar SLP */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody className="black-text d-flex-center">
                                        <MDBBox tag="div" className="text-center">
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOTAL_SCHOLAR_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                {this.numberWithCommas(this.state.totalScholarSLP)}
                                            </MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((Number(this.state.totalScholarSLP) * Number(this.state.currencySLP)).toFixed(2))}</MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
        
                            {/* Total Sponsor SLP */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody className="black-text d-flex-center">
                                        <MDBBox tag="div" className="text-center">
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOTAL_SPONSOR_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                {this.numberWithCommas(this.state.totalSponsorSLP)}
                                            </MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.numberWithCommas((Number(this.state.totalSponsorSLP) * (this.state.currencySLP)).toFixed(2))}</MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
        
                            {/* Total Manager SLP */}
                            <MDBCol size="6" md="4" lg="2" className="my-2">
                                <MDBCard className="z-depth-2 player-details h-180px">
                                    <MDBCardBody 
                                        className={this.state.isUser === MESSAGE.MANAGER ? "black-text cursor-pointer d-flex-center" : "black-text d-flex-center"}
                                        onClick={this.state.isUser === MESSAGE.MANAGER && this.state.managerEarnings ? this.modalManagerEarningToggle() : () => {}} >
                                        <MDBBox tag="div" className="text-center">
                                            <MDBBox tag="span" className="d-block">{MESSAGE.TOTAL_MANAGERCLAIMABLE_SLP}</MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">
                                                <img src="/assets/images/smooth-love-potion.png" className="w-24px mr-1 mt-0pt3rem-neg" alt="SLP" />
                                                {
                                                    this.state.isUser === MESSAGE.MANAGER ? (
                                                        this.numberWithCommas(this.state.totalManagerClaimableSLP)
                                                    ) : (0)
                                                }
                                            </MDBBox>
                                            <MDBBox tag="span" className="d-block font-size-1pt3rem font-weight-bold">&#8369; {this.state.isUser === MESSAGE.MANAGER ? (this.numberWithCommas((Number(this.state.totalManagerClaimableSLP) * Number(this.state.currencySLP)).toFixed(2))) : ("0.00")}</MDBBox>
                                        </MDBBox>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </React.Fragment>
                    ) : ("")}

                    {this.state.isUser !== MESSAGE.MANAGER && !this.state.isUserEmail && Object.keys(this.state.playerRecords).length > 0 ? (
                        <React.Fragment>
                            <MDBCol size="12" className="mb-3">
                                <MDBBox tag="div" className="py-3 px-2 text-center player-details cursor-pointer" onClick={this.modalLeaderboardToggle()}>
                                    {/* Top ELO / MMR Rank */}
                                    <MDBBox tag="span" className="d-block d-md-inline d-lg-inline">{MESSAGE.TOP_MMR}: <strong>{this.state.topUserRank}</strong></MDBBox>
                                    {/* Top In Game SLP */}
                                    <MDBBox tag="span" className="d-block d-md-inline d-lg-inline ml-2">{MESSAGE.TOP_INGAME_SLP}: <strong>{this.state.topUserInGameSLP}</strong></MDBBox>
                                </MDBBox>
                            </MDBCol>
                        </React.Fragment>
                    ) : ("")}

                    {this.state.isUser === this.state.isSponsorName && this.state.totalSponsorSLP > 0 ? (
                        <React.Fragment>
                            <MDBCol size="12">
                                <MDBBox tag="div" className="py-3 px-2 text-center player-details">
                                    <MDBBox tag="span" className="blue-whale d-block cursor-pointer">
                                        {MESSAGE.SPONSOR_EARNING}: {MESSAGE.SLP} {this.state.totalSponsorSLP} (&#8369; {this.numberWithCommas((Number(this.state.totalSponsorSLP) * (this.state.currencySLP)).toFixed(2))})
                                    </MDBBox>
                                </MDBBox>
                            </MDBCol>
                        </React.Fragment>
                    ) : ("")}
                </React.Fragment>
            )
        }
    }

    // Render Modal for viewing of Leaderboard
    renderModalLeaderboard() {
        return (
            <React.Fragment>
                <MDBModal isOpen={this.state.isModalLeaderboardOpen} size="lg">
                    <MDBModalHeader toggle={this.modalLeaderboardToggle()}>{MESSAGE.LEADERBOARD}</MDBModalHeader>
                    <MDBModalBody>
                        <MDBDataTable
                            striped bordered hover responsive noBottomColumns
                            sortable={false}
                            entries={5}
                            displayEntries={false}
                            data={this.state.leaderboardDatatable}
                            className="default-datatable-container text-center"
                        />
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render Modal for viewing of Manager Earning
    renderModalManagerEarnings() {
        if(this.state.managerEarnings) {
            return (
                <React.Fragment>
                    <MDBModal isOpen={this.state.isModalManagerEarningOpen} size="lg">
                        <MDBModalHeader toggle={this.modalManagerEarningToggle()}>{MESSAGE.MANAGER_ALL_EARNINGS}</MDBModalHeader>
                        <MDBModalBody>
                            <React.Fragment>
                                <MDBTable scrollY maxHeight="70vh" bordered striped responsive>
                                    <MDBTableHead color="rgba-teal-strong" textWhite>
                                        <tr>
                                            <th colSpan="5" className="text-center font-weight-bold">{MESSAGE.MANAGER_EARNING}</th>
                                        </tr>
                                    </MDBTableHead>
                                    <MDBTableBody>
                                        {/* Total Earnings */}
                                        <tr className="text-center">
                                            <td rowSpan="2" className="font-weight-bold v-align-middle text-uppercase">{MESSAGE.TOTAL_EARNINGS}</td>
                                            <td colSpan="4" className="font-weight-bold">{MESSAGE.SLP}: {this.numberWithCommas(this.state.managerEarnings.TOTAL.SLP)}</td>
                                        </tr>
                                        <tr className="text-center">
                                            <td colSpan="4" className="font-weight-bold table-gray-bg"><span>&#8369; </span>{this.numberWithCommas((this.state.managerEarnings.TOTAL.PHP).toFixed(2))}</td>
                                        </tr>
                                        {/* Income by Categories */}
                                        <tr className="text-center">
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.BUY}</td>
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.BREED}</td>
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.ROI}</td>
                                            <td colSpan="2" className="font-weight-bold text-uppercase">{MESSAGE.INCOME}</td>
                                        </tr>
                                        <tr className="text-center">
                                            <td>{this.numberWithCommas((this.state.managerEarnings.TOTAL.BUY).toFixed(2))}</td>
                                            <td>{this.numberWithCommas((this.state.managerEarnings.TOTAL.BREED).toFixed(2))}</td>
                                            <td className={this.state.managerEarnings.REACHEDROI ? "green-text" : "red-text"}>{this.numberWithCommas((this.state.managerEarnings.TOTAL.ROI).toFixed(2))}</td>
                                            <td>{this.numberWithCommas((this.state.managerEarnings.TOTAL.INCOME).toFixed(2))}</td>
                                        </tr>
                                        {/* Earning per cash out */}
                                        <tr className="rgba-teal-strong-bg">
                                            <td colSpan="5" className="text-center font-weight-bold white-text">{MESSAGE.EARNINGS}</td>
                                        </tr>
                                        <tr className="text-center">
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.DATE}</td>
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.SLP}</td>
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.SLP_PRICE}</td>
                                            <td className="font-weight-bold text-uppercase">{MESSAGE.EARNING}</td>
                                        </tr>
                                        {
                                            Object.keys(this.state.managerEarnings.CLAIMED).length > 0 ? (
                                                this.state.managerEarnings.CLAIMED.sort((a, b) =>  moment(b.EARNED_ON).unix() - moment(a.EARNED_ON).unix() ).map(items => (
                                                    <tr key={items.INDEX} className="text-center">
                                                        <td>{<Moment format="MMM DD, YYYY">{items.EARNED_ON}</Moment>}</td>
                                                        <td>{items.SLPTOTAL}</td>
                                                        <td className="text-uppercase">{items.SLPCURRENCY}</td>
                                                        <td>{(items.PHPTOTAL).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : ("")
                                        }
                                    </MDBTableBody>
                                </MDBTable>
                            </React.Fragment>
                        </MDBModalBody>
                    </MDBModal>
                </React.Fragment>
            )
        }
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
                                    {this.state.modalPlayerDetails[0].NAME}
                                </React.Fragment>
                            ) : (MESSAGE.DETAILS)
                        }
                    </MDBModalHeader>
                    <MDBModalBody>
                        {/* Header details */}
                        {
                            Object.keys(this.state.modalPlayerDetails).length > 0 ? (
                                <React.Fragment>
                                    <MDBRow between>
                                        {/* Started playing */}
                                        <MDBCol size="12" md="6" lg="6">
                                            <MDBBox tag="span" className="d-block">
                                                <strong>{MESSAGE.STARTED_ON}:</strong> <Moment format="MMM DD, YYYY">{this.state.modalPlayerDetails[0].STARTED_ON}</Moment>
                                            </MDBBox>
                                        </MDBCol>
                                        {/* Market Place link */}
                                        <MDBCol size="12" md="6" lg="6">
                                            <MDBBox tag="u" className="d-block d-md-none d-lg-none">
                                                <a href={"https://marketplace.axieinfinity.com/profile/" + this.state.modalPlayerDetails[0].ADDRESS + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                    {MESSAGE.OPEN_MARKETPLACE_PROFILE}
                                                </a>
                                            </MDBBox>
                                            <MDBBox tag="u" className="d-none d-md-block d-lg-block text-right">
                                                <a href={"https://marketplace.axieinfinity.com/profile/" + this.state.modalPlayerDetails[0].ADDRESS + "/axie"} target="_blank" rel="noreferrer" className="black-text">
                                                    {MESSAGE.OPEN_MARKETPLACE_PROFILE}
                                                </a>
                                            </MDBBox>
                                        </MDBCol>
                                        {/* Ronin Address */}
                                            <MDBCol size="12">
                                                <MDBBox tag="span" className="d-block selectable-text">
                                                    <strong>{MESSAGE.RONIN}:</strong> {this.state.modalPlayerDetails[0].ADDRESS}
                                                </MDBBox>
                                            </MDBCol>
                                        {/* Email */}
                                        {
                                            this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (this.state.modalPlayerDetails[0].EMAIL).toLowerCase() ? (
                                                <MDBCol size="12">
                                                    <MDBBox tag="span" className="d-block selectable-text">
                                                        <strong>{MESSAGE.EMAIL}:</strong> {this.state.modalPlayerDetails[0].EMAIL}
                                                    </MDBBox>
                                                </MDBCol>
                                            ) : ("")
                                        }
                                    </MDBRow>

                                    {
                                        this.state.isViewAxieTeam === MESSAGE.VIEW_AXIE_TEAM ? (
                                            // View Gained SLP Chart
                                            <React.Fragment>
                                                {
                                                    // Display only the view earnings for specific user
                                                    this.state.isUser === MESSAGE.MANAGER || !this.state.isUserEmail || (this.state.isUser).toLowerCase() === (this.state.modalPlayerDetails[0].details.EMAIL).toLowerCase() ? (
                                                        <MDBBox tag="u" className="d-block mb-2 cursor-pointer" onClick={this.onScholarEaningNActiveTeamHandle.bind(this)}>{MESSAGE.VIEW_EARNINGS}</MDBBox> // Opposite label x for hide and show
                                                    ) : ("")
                                                }

                                                {
                                                    // Display Active Axie Team
                                                }
                                            </React.Fragment>
                                        ) : (
                                            // View Earnings
                                            <React.Fragment>
                                                <MDBBox tag="u" className="d-block mb-2 cursor-pointer" onClick={this.onScholarEaningNActiveTeamHandle.bind(this)}>{MESSAGE.VIEW_AXIE_TEAM}</MDBBox> {/* Opposite label x for hide and show */}
                                                {/* Table Details */}
                                                <MDBTable scrollY maxHeight="70vh" bordered striped responsive className="mt-2">
                                                    <MDBTableBody>
                                                        {/* Total Income */}
                                                        <tr>
                                                            <td colSpan="4" className="text-center font-weight-bold rgba-teal-strong white-text">
                                                                <span>{MESSAGE.TOTALINCOME}: &#8369; </span>
                                                                {(this.state.modalPlayerDetails[0].WITHDRAWEARNING.TOTALINCOME).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        <tr className="text-center">
                                                            <td className="font-weight-bold text-uppercase">{MESSAGE.DATE}</td>
                                                            <td className="font-weight-bold text-uppercase">{MESSAGE.SLP}</td>
                                                            <td className="font-weight-bold text-uppercase">{MESSAGE.SLP_PRICE}</td>
                                                            <td className="font-weight-bold text-uppercase">{MESSAGE.EARNING}</td>
                                                        </tr>
                                                        {
                                                            
                                                            this.state.modalPlayerDetails[0].WITHDRAWEARNING.CLAIMED !== undefined && 
                                                            Object.keys(this.state.modalPlayerDetails[0].WITHDRAWEARNING.CLAIMED).length > 0 ? (
                                                                (this.state.modalPlayerDetails[0].WITHDRAWEARNING.CLAIMED).sort((a, b) => moment(b.WITHDRAW_ON).unix() - moment(a.WITHDRAW_ON).unix()).map(items => (
                                                                    <tr key={items.INDEX} className="text-center">
                                                                        <td>{<Moment format="MMM DD, YYYY">{items.WITHDRAW_ON}</Moment>}</td>
                                                                        <td>{items.SLPTOTAL}</td>
                                                                        <td className="text-uppercase">{items.SLPCURRENCY}</td>
                                                                        <td>{(items.PHPTOTAL).toLocaleString()}</td>
                                                                    </tr>
                                                                ))
                                                            ) : ("")
                                                        }
                                                    </MDBTableBody>
                                                </MDBTable>
                                            </React.Fragment>
                                        )
                                    }
                                </React.Fragment>
                            ) : ("")
                        }
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render Modal for adding new team
    renderModalIskoInputs() {
        return (
            <React.Fragment>
                <MDBModal isOpen={this.state.isModalIskoInputsOpen} size="md">
                    <MDBModalHeader toggle={this.modalIskoInputs("")} className="blue-whale">{MESSAGE.LOKI_INPUTS}</MDBModalHeader>
                    <MDBModalBody>
                        <MDBNav className="nav-tabs">
                            <MDBNavItem>
                                <span
                                    className={this.state.tabIskoInputsActive === "1" ? "nav-link cursor-pointer active" : "nav-link cursor-pointer"}
                                    onClick={this.tabsIskoInputs("1")}
                                    role="tab" >
                                    {MESSAGE.ADD_EDIT}
                                </span>
                            </MDBNavItem>
                            <MDBNavItem>
                                <span
                                    className={this.state.tabIskoInputsActive === "2" ? "nav-link active cursor-pointer" : "nav-link cursor-pointer"}
                                    onClick={this.tabsIskoInputs("2")}
                                    role="tab" >
                                    {MESSAGE.WITHDRAW}
                                </span>
                            </MDBNavItem>
                            <MDBNavItem>
                                <span
                                    className={this.state.tabIskoInputsActive === "3" ? "nav-link active cursor-pointer" : "nav-link cursor-pointer"}
                                    onClick={this.tabsIskoInputs("3")}
                                    role="tab" >
                                    {MESSAGE.MANAGER_EARNING}
                                </span>
                            </MDBNavItem>
                        </MDBNav>
                        <MDBTabContent activeItem={this.state.tabIskoInputsActive} >
                            <MDBTabPane tabId="1" role="tabpanel">
                                <form onSubmit={this.onAddEditRecordHandle.bind(this)} className="addEdit-inputHolder">
                                    <MDBBox tag="div" className="grey-text">
                                        <MDBBox tag="div" className="select-mdb-custom mt-3">
                                            <MDBBox tag="select" className="select-mdb-content" onChange={this.handleAddEditIskoChange.bind(this)} value={this.state.slctAddEditId}>
                                                <MDBBox tag="option" value="">{MESSAGE.ADDNEW_ISKO}</MDBBox>
                                                {
                                                    Object.keys(this.state.playerRecords).length > 0 ? (
                                                        this.state.playerRecords.sort(function (a, b) {
                                                            if (a.NAME > b.NAME) {
                                                                return 1;
                                                            } else if (a.NAME < b.NAME) {
                                                                return -1;
                                                            } else {
                                                                return 0;
                                                            }
                                                        }).map((item) => (
                                                            <MDBBox tag="option" key={item.ADDRESS} value={item.ADDRESS}>
                                                                {item.NAME}
                                                            </MDBBox>
                                                        ))
                                                    ) : ("")
                                                }
                                            </MDBBox>
                                            <MDBBox tag="span" className="select-mdb-bar"></MDBBox>
                                            <MDBBox tag="label" className="col select-mdb-label"></MDBBox>
                                        </MDBBox>
                                        <div className="md-form">
                                            <i data-test="fa" className="fa fa-address-book prefix"></i>
                                            <input data-test="input" type="text" className="form-control" name="ADDRESS" required />
                                            <label className="active">{MESSAGE.RONIN_ADDRESS}</label>
                                        </div>
                                        <div className="md-form">
                                            <i data-test="fa" className="fa fa-user prefix"></i>
                                            <input data-test="input" type="text" className="form-control" name="NAME" required />
                                            <label className="active">{MESSAGE.NAME}</label>
                                        </div>
                                        <div className="md-form">
                                            <i data-test="fa" className="fa fa-envelope prefix"></i>
                                            <input data-test="input" type="email" className="form-control" name="EMAIL" required />
                                            <label className="active">{MESSAGE.EMAIL}</label>
                                        </div>
                                        <div className="md-form">
                                            <i data-test="fa" className="fa fa-lock prefix"></i>
                                            <input data-test="input" type="text" className="form-control" name="PASS" required />
                                            <label className="active">{MESSAGE.PASSWORD}</label>
                                        </div>
                                        <MDBRow className="mt-1pt5rem-neg" between>
                                            <MDBCol size="6">
                                                <div className="md-form">
                                                    <input data-test="input" type="number" className="form-control" name="SHR_MANAGER" min="0" max="100" required />
                                                    <label className="active">{MESSAGE.MANAGER}</label>
                                                </div>
                                            </MDBCol>
                                            <MDBCol size="6">
                                                <div className="md-form">
                                                    <input data-test="input" type="number" className="form-control" name="SHR_SCHOLAR" min="0" max="100" required />
                                                    <label className="active">{MESSAGE.SCHOLAR}</label>
                                                </div>
                                            </MDBCol>
                                        </MDBRow>
                                        <MDBInput containerClass="md-form mt-2rem-neg checkbox-mdb-custom" label={MESSAGE.HASSPONSOR} type="checkbox" id="hasSponsor-checkbox" checked={this.state.hasSponsor} onChange={this.handleHasSponsorCheckChange.bind(this)} />
                                        {
                                            this.state.hasSponsor ? (
                                                <MDBRow className="mt-1pt5rem-neg" between>
                                                    <MDBCol size="6">
                                                        <div className="md-form">
                                                            <i data-test="fa" className="fa fa-user prefix"></i>
                                                            <input data-test="input" type="text" className="form-control" name="SPONSOR_NAME" required />
                                                            <label className="active">{MESSAGE.SPONSOR_NAME}</label>
                                                        </div>
                                                    </MDBCol>
                                                    <MDBCol size="6">
                                                        <div className="md-form">
                                                            <input data-test="input" type="number" className="form-control" name="SHR_SPONSOR" min="0" max="100" required />
                                                            <label className="active">{MESSAGE.SPONSOR_SHARE}</label>
                                                        </div>
                                                    </MDBCol>
                                                </MDBRow>
                                            ) : ("")
                                        }
                                        <MDBInput containerClass="md-form mt-2rem-neg checkbox-mdb-custom redLabel" label={MESSAGE.DELETE} type="checkbox" id="isDelete-checkbox" checked={this.state.isDeleted} onChange={this.handleIsDeleteCheckChange.bind(this)} />
                                        <MDBBox tag="div" className={this.state.isValidAddTeam === 0 ? "d-none" : this.state.isValidAddTeam ? "d-none" : "invalid-feedback mt-0pt3rem-neg mb-2 px-3 d-block"}>{this.state.errorMsg}</MDBBox>
                                    </MDBBox>
                                    <MDBBox tag="div" className="text-center">
                                        <button className="btn btn-default waves-effect waves-light">
                                            <MDBIcon icon="paper-plane" className="mr-1" />
                                            {MESSAGE.SUBMIT}
                                        </button>
                                    </MDBBox>
                                </form>
                            </MDBTabPane>
                            <MDBTabPane tabId="2" role="tabpanel">
                                <MDBBox tag="div" className="select-mdb-custom mt-3">
                                    <MDBBox tag="select" className="select-mdb-content" onChange={this.handleClaimChange.bind(this)} value={this.state.slctClaimId}>
                                        <MDBBox tag="option" value="">{MESSAGE.SELECT_NAME}</MDBBox>
                                        {
                                            Object.keys(this.state.playerRecords).length > 0 ? (
                                                this.state.playerRecords.sort(function (a, b) {
                                                    if (a.NAME > b.NAME) {
                                                        return 1;
                                                    } else if (a.NAME < b.NAME) {
                                                        return -1;
                                                    } else {
                                                        return 0;
                                                    }
                                                }).map((item) => (
                                                    <MDBBox tag="option" key={item.ADDRESS} value={item.ADDRESS}>
                                                        {item.NAME}
                                                    </MDBBox>
                                                ))
                                            ) : ("")
                                        }
                                    </MDBBox>
                                    <MDBBox tag="span" className="select-mdb-bar"></MDBBox>
                                    <MDBBox tag="label" className="col select-mdb-label"></MDBBox>
                                </MDBBox>
                                <form onSubmit={this.onWithdrawHandle.bind(this)} className="claim-inputHolder">
                                    <MDBBox tag="div" className="grey-text">
                                        <MDBInput label={MESSAGE.RONIN_ADDRESS} name="ADDRESS" type="text" required disabled />
                                        <div className="md-form">
                                            <input data-test="input" type="number" min="0" className="form-control" name="SLPTOTAL" required />
                                            <label className="active">{MESSAGE.TOTAL_SLP}</label>
                                        </div>
                                        <div className="md-form">
                                            <input data-test="input" type="number" min="0" className="form-control" name="SLPCURRENCY" step="0.01" required />
                                            <label className="active">{MESSAGE.SLP_CURRENCY}</label>
                                        </div>
                                        <div className="md-form">
                                            <input data-test="input" type="date" className="form-control" name="WITHDRAW_ON" required />
                                            <label className="active">{MESSAGE.WITHDRAWON}</label>
                                        </div>
                                    </MDBBox>
                                    <MDBBox tag="div" className={this.state.isValidWithdraw === 0 ? "d-none" : this.state.isValidWithdraw ? "d-none" : "invalid-feedback mt-1pt5rem-neg mb-2 px-3 d-block"}>{this.state.errorMsg}</MDBBox>
                                    <MDBBox tag="div" className="text-center">
                                        <button className="btn btn-default waves-effect waves-light" disabled>
                                            <MDBIcon icon="paper-plane" className="mr-1" />
                                            {MESSAGE.SUBMIT}
                                        </button>
                                    </MDBBox>
                                </form>
                            </MDBTabPane>
                            <MDBTabPane tabId="3" role="tabpanel">
                                <form onSubmit={this.onManagerEarnedHandle.bind(this)} className="managerEarn-inputHolder">
                                    <MDBBox tag="div" className="grey-text">
                                        <MDBInput label={MESSAGE.TOTAL_SLP} name="SLPTOTAL" type="number" min="0" required />
                                        <MDBInput label={MESSAGE.SLP_CURRENCY} name="SLPCURRENCY" type="number" step="0.01" min="0" required />
                                        <MDBBox tag="div" className="select-mdb-custom mt-2">
                                            <MDBBox tag="select" className="select-mdb-content">
                                                <MDBBox tag="option" value={MESSAGE.BUY}>{MESSAGE.BUY}</MDBBox>
                                                <MDBBox tag="option" value={MESSAGE.BREED}>{MESSAGE.BREED}</MDBBox>
                                                <MDBBox tag="option" value={MESSAGE.WITHDRAW}>{MESSAGE.WITHDRAW}</MDBBox>
                                            </MDBBox>
                                            <MDBBox tag="span" className="select-mdb-bar"></MDBBox>
                                            <MDBBox tag="label" className="col select-mdb-label"></MDBBox>
                                        </MDBBox>
                                        <div className="md-form">
                                            <input data-test="input" type="date" className="form-control" name="EARNED_ON" required />
                                            <label className="active">{MESSAGE.EARNEDON}</label>
                                        </div>
                                    </MDBBox>
                                    <MDBBox tag="div" className={this.state.isValidManagerEarn === 0 ? "d-none" : this.state.isValidManagerEarn ? "d-none" : "invalid-feedback mt-1pt5rem-neg mb-2 px-3 d-block"}>{this.state.errorMsg}</MDBBox>
                                    <MDBBox tag="div" className="text-center">
                                        <button className="btn btn-default waves-effect waves-light">
                                            <MDBIcon icon="paper-plane" className="mr-1" />
                                            {MESSAGE.SUBMIT}
                                        </button>
                                    </MDBBox>
                                </form>
                            </MDBTabPane>
                        </MDBTabContent>
                    </MDBModalBody>
                </MDBModal>
            </React.Fragment>
        )
    }

    // Render Empty Detail
    renderEmptyDetails() {
        return (
            <React.Fragment>
                <MDBRow className="justify-content-center align-self-center">
                    <MDBCol size="12" className="justify-content-center align-self-center text-center">
                        <img src="/assets/images/axie_char.png" className="w-200px mt-5" alt="No Data Found" />
                        <MDBBox tag="span" className="d-block py-3 font-size-3rem font-family-architects-daughter red-text">{MESSAGE.SOMETHING_WENT_WRONG}</MDBBox>
                        <MDBBox tag="span" className="d-block font-size-3rem font-family-architects-daughter orange-text">{MESSAGE.NODATA_FOUND}</MDBBox>
                    </MDBCol>
                </MDBRow>
            </React.Fragment>
        )
    }

    render() {
        document.title = MESSAGE.HOMETITLE;
        return (
            <MDBBox tag="div" className="home-wrapper">
                <MDBAnimation type="bounce" className="z-index-1 position-fixed guides-btn">
                    {
                        this.state.isUser === MESSAGE.MANAGER ? (
                            <React.Fragment>
                                {/* Scholar's input */}
                                <button type="button" className="btn btn-default waves-effect waves-light d-block iskoInputs"
                                    onClick={this.modalIskoInputs()}>
                                    <MDBIcon icon="graduation-cap" className="fa-2x" />
                                </button>

                                {
                                    //  Object.keys(this.state.exportData).length > 0 ? (
                                    //     <React.Fragment>
                                    //         {/* Export Data */}
                                    //         <ExportCSV csvData={this.state.exportData} fileName={MESSAGE.TEAMLOKI + "_" + moment().format("MMDDYYYY_HHmmss")}/>
                                    //     </React.Fragment>
                                    // ) : ("")
                                }
                            </React.Fragment>
                        ) : ("")
                    }
                </MDBAnimation>
                
                {
                    !this.state.isLoaded ? (
                        // Loading
                    <MDBBox tag="div" className="loader-section">
                        <MDBBox tag="div" className="position-fixed z-index-9999 l-0 t-0 r-0 b-0 m-auto overflow-visible flex-center">
                            <MDBBox tag="span" className="loader-spin-dual-ring"></MDBBox>
                            <MDBBox tag="span" className="ml-2 font-size-1rem white-text">{MESSAGE.LOADING_TEXT}</MDBBox>
                        </MDBBox>
                        <MDBBox tag="div" className="loader-backdrop position-fixed z-index-1040 l-0 t-0 r-0 b-0 black"></MDBBox>
                    </MDBBox>
                    ) : ("")
                }

                {/* Render Notification Bar for Page refresh, Coingecko details and Top Scholar */}
                <MDBContainer className="pt-5 mt-5 position-relative">
                    <MDBRow>
                        {this.renderCurrencies()}
                        {this.renderSubDetails()}
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

                {/* Render Modal */}
                {this.renderModalLeaderboard()}
                {this.renderModalManagerEarnings()}
                {this.renderModalPlayerDetails()}
                {this.renderModalIskoInputs()}
            </MDBBox>
        )
    }
}

export default Home