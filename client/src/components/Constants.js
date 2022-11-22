const APIURI = "/mongodb/api/";
const ISDEVLOGGER = false;
const LOGTAIL = "miTYRjaQcVfyQTgqUormjzCw";

const MESSAGE = {
    HOMETITLE: "Home | Team Loki Tracker",
    FOOTERTITLE: "Copyright: Team Loki x To the Moon ® All Rights Reserved.",
    TEAMLOKI: "Team Loki",
    TOTHE_MOON: "To the Moon",
    LOADING_TEXT: "Loading, please wait...",
    UNEXPECTED_ERROR: "Unexpected error, please reload the page!",
    ERROR_OCCURED: "Oh well, you failed. Here some thoughts on the error that occured:",
    INVALID_CREDENTIAL: "Invalid credential. Please try again.",
    SOMETHING_WENT_WRONG: "Something went wrong!",
    NODATA_FOUND: "No Data Found.",
    PAGE_REFRESH: "Page refresh automatically within 120 seconds.",
    PRICE_BASEON: "Prices are based on",
    BINANCE: "Binance",
    COINGECKO: "CoinGecko",
    CURRENT_EXCHANGERATE: "Current exchange rate",
    SIGNIN: "Sign In",
    LOGIN: "Login",
    LOGOUT: "Logout",
    INPUT_USER: "Type your username or email",
    VIEW_MANAGER_EARNING: "View Manager Earnings",
    VIEW_SPONSOR_EARNING: "View Sponsor Earnings",
    MANAGER_EARNING: "Manager Earnings",
    SPONSOR_EARNING: "Sponsor Earnings",
    SUBMANAGER: "SUBManager",
    MANAGER: "Manager",
    SPONSOR: "Sponsor",
    SCHOLAR: "Scholar",
    SPONSOR_SHARE: "Sponsor Share",
    SPONSOR_NAME: "Sponsor Name",
    SLP: "SLP",
    AXS: "AXS",
    SLP_DESC: "Smooth Love Potion",
    TOP_RANK: "Top RANK",
    TOP_MMR: "Top MMR",
    TOP_INGAME_SLP: "Top InGame SLP",
    TOP_MMR_SLP: "Top MMR and SLP",
    MMR: "MMR",
    ELO: "ELO",
    RANK: "Rank",
    RANKING: "Ranking",
    LEADERBOARD: "Leaderboard",
    LAST_CLAIMED_SLP: "Last Claimed SLP",
    LAST_CLAIMED_AT: "Last Claimed At",
    CLAIMON: "Claim On",
    ADV: "ADV",
    ADVENTURE: "Adventure",
    INGAME: "InGame",
    SHARE: "Share",
    SHARED: "Shared",
    RONIN: "Ronin",
    RONIN_ADDRESS: "Ronin Address",
    TOTAL: "Total",
    EARNING: "Earning",
    EARNINGS: "Earnings",
    TOTAL_EARNINGS: "Total Earnings",
    CLOSE: "Close",
    NAME: "Name",
    ARENAGAME_STATUS: "Arena Game Status",
    WIN: "Win",
    LOSE: "Lose",
    DRAW: "Draw",
    WIN_RATE: "Win Rate",
    DAYS: "Day(s)",
    OPEN_MARKETPLACE_PROFILE: "View marketplace profile",
    OF: "of",
    ADV_QUEST_TODAY: "Adventure SLP Quest (Today)",
    INGAME_SLP: "InGame SLP",
    INGAME_SLP_SHARING: "In Game SLP Sharing",
    RONIN_PLUS_SHARING_SLP: "Ronin SLP + Sharing SLP",
    PHP_CURRENCY: "PHP Currency",
    WITHDRAWABLE: "Withdrawable",
    MINT_SLP: "Mint SLP",
    AVERAGE: "Average",
    AVERAGE_SLP_PERDAY: "Average SLP per day",
    AVERAGE_SLP_PERDAY_V2: "Average SLP / Day",
    AVG_SLP_PERDAY: "Avg. SLP/Day",
    SHARE_SLP: "Share SLP",
    VIEW_TOTALINCOME: "View Total Income",
    TOTALINCOME: "Total Income",
    NOTIFBAR_CLICKABLE: "Notification bar is Clickable.",
    SLP_PRICE: "SLP Price",
    DATE: "Date",
    STARTED_ON: "Started On",
    STARTED: "Started",
    END: "END",
    TOTAL_INGAME_SLP: "Total InGame SLP",
    TOTAL_AVERAGE_SLP: "Total Average SLP",
    TOTAL_MANAGER_SLP: "Total Manager SLP",
    TOTAL_MANAGERCLAIMABLE_SLP: "Total Manager Claimable SLP",
    TOTAL_SPONSOR_SLP: "Total Sponsor SLP",
    TOTAL_SCHOLAR_SLP: "Total Scholar SLP",
    ADVENTURE_SLP: "Adventure SLP",
    SHARED_SLP: "Shared SLP",
    RONIN_SLP: "Ronin SLP",
    TOTAL_SLP: "Total SLP",
    TOTAL_SLP_PHP: "Total SLP/PHP",
    EARNINGS_PHP: "Earnings (PHP)",
    DETAIL: "Detail",
    DETAILS: "Details",
    CATEGORY: "Category",
    VIEW_ALL_EARNINGS: "View All Earnings",
    VIEW_CURRENT_EARNINGS: "View Current Earnings",
    MANAGER_ALL_EARNINGS: "All Manager Earnings",
    MANAGER_CURRENT_EARNINGS: "Current Manager Earnings",
    MMR_RANKING: "MMR Ranking",
    TOTAL_CURRENT_EARNINGS: "Total Current Earnings",
    EMAIL_LOWMMR_SUBJECT: "Team Loki MMR Ranking",
    EMAIL_LOWMMR_MESSAGE: "You receive this automated email due to your MMR Ranking, keep it up and learn more. If need help, don't hesitate to ping on our Messenger Group Chat. Stay Low Key as our tagline.",
    EMAIL_WARNINGMMR_MESSAGE: "You receive this automated email due to your MMR Ranking, keep playing and learn more. Stay Low Key as our tagline.",
    ROI_DESCRIPTIVE: "Return of Investment",
    ROI: "ROI",
    BREED: "Breed",
    BUY: "Buy",
    INCOME: "Income",
    GUIDE_HERE: "Guides here!",
    PVP_ENERGY: "PvP Energy",
    MANAGER_SLP: "Manager SLP",
    SPONSOR_SLP: "Sponsor SLP",
    SCHOLAR_SLP: "Scholar SLP",
    EMAIL: "Email",
    PASSWORD: "Password",
    DAILYSLP: "Daily SLP",
    GET: "GET",
    POST: "POST",
    EMPTY: "EMPTY",
    INSERT: "Insert",
    UPDATE: "UPDATE",
    ERROR_FETCH_DAILYSLP: 'Error in fetching data of Daily SLP',
    ERROR_FILTER_DAILYSLP: 'Error in filter data of Daily SLP',
    UPDATE_ISKODATA: "Update Scholar Data",
    SHARELIMIT: "Sharing must be equal to 100",
    LOKI_INPUTS: "Loki Inputs",
    SUBMIT: "Submit",
    ADD_EDIT: "Add / Edit",
    ADD: "Add",
    EDIT: "Edit",
    CLAIM: "Claim",
    WITHDRAW_EXCHANGE: "Withdraw / Exchange",
    WITHDRAW: "Withdraw",
    WITHDRAWON: "Withdraw On",
    SELECT_NAME: "Select Name",
    SLP_CURRENCY: "SLP Currency",
    EARNEDON: "Earned On",
    ADDNEW_ISKO: "Add New Scholar",
    HASSPONSOR: "Has Sponsor?",
    YESTERDAYSLP: "Yesterday SLP",
    VIEW_GAINEDSLP_CHART: "View Gained SLP Chart",
    VIEW_AXIE_TEAM: "View Active Axie Team",
    VIEW_EARNINGS: "View Earnings",
    REWARDS_SLP: "Rewards SLP",
    PHP: "PHP",
    MGR: "MGR",
    SCH: "SCH",
    DELETE: "Delete?",
    HIGH_SLPGAINED: "Highest Gained SLP",
    BATTELOG_ISDISPLAY: "Show Battle Log?",
    RESET_DAILYSLP: "Reset Daily SLP",
    PROCESS_COUNT: "Process Count",
    RUN_TOKEN: "Running Access Token",
    ERROR_JSONPARSE: "Error in JSON Parsing",
    BAD_REQUEST: "400 Bad Request",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
    EMPTYPAYLOAD: "Empty Payload",
    ERROR_PROCEDURE: "Error in QUERY Procedure",
    STARTED_SELECTQUERY: "SELECT QUERY Started!",
    END_SELECTQUERY: "SELECT QUERY END!",
    STARTED_INSERTQUERY: "INSERT QUERY Started!",
    END_INSERTQUERY: "INSERT QUERY END!",
    STARTED_UPDATEQUERY: "UPDATE QUERY Started!",
    END_UPDATEQUERY: "UPDATE QUERY END!",
    STARTED_DELETEQUERY: "DELETE QUERY Started!",
    END_DELETEQUERY: "DELETE QUERY END!",
    STARTEDPOST: "POST Started!",
    ENDPOST: "POST QUERY END!",
    TEAMRECORD: "Team Record",
    MANAGER_EARNED: "Manager Earned",
    STARTED_GENERATE_TOKEN: "Generate Access Token Started",
    ERROR_GENERATE_TOKEN: "Error in Generation of Access Token",
    END_GENERATE_TOKEN: "Generate Access Token End",
    STARTED_GENERATE_RANDOMMSG: "Generate Access Token Random Message Started",
    CANT_GEN_TOKEN_RANDOMMSG: "Could not generate Access Token Random Message",
    STARTED_GENERATE_SIGNRONINMSG: "Generate Sign Ronin Message Started",
    CANT_GEN_TOKEN_SIGNRONINMSG: "Could not Sign Ronin Message",
    STARTED_CREATE_ACCESSMSG: "Create Access Token Started",
    CANT_GEN_TOKEN_ACCESSMSG: "Could not Create Access Token",
    STARTED_AUTHLOGIN: "Auth Login Started",
    END_AUTHLOGIN: "Auth Login End",
    ERROR_AUTHLOGIN: "Error in Auth Login",
    STARTED_INGAMESLP_API: "Origin InGame SLP API Started",
    STARTED_INGAMESLP: "Origin InGame SLP Started",
    END_INGAMESLP: "Origin InGame SLP End",
    ERROR_INGAMESLP: "Error in Origin InGame SLP",
    STARTED_CRYPTOCOINS_API: "Crypto Coins API Started",
    STARTED_CRYPTOCOINS: "Crypto Coins Started",
    END_CRYPTOCOINS: "Crypto Coins End",
    ERROR_CRYPTOCOINS: "Error in Crypto Coins",
    SERVER_ISRUNNING_PORT: "Server is running on port:",
    SERVER_ISRUNNING_URI: "Server is running on URI:",
    INFO: "Info",
    ERROR: "Error",
    WARNING: "Warning",
    SLPBURNED_TODAY: "SLP Burned as of Today",
    AS_TODAY: "As of Today:",
    SLPBURNED: "SLP Burned",
    SLPMINTED: "SLP Minted",
    SLPSTATS: "SLP Statistics",
    BURNED: "Burned"
}

const TABLES = {
    TBUSERPROFILE: "TB_USERPROFILE",
    TBMANAGEREARNED: "TB_MANAGEREARNED",
    TBWITHDRAW: "TB_WITHDRAW",
    TBDAILYSLP: "TB_DAILYSLP",
    TBYESTERDAYSLP: "TB_YESTERDAYSLP"
}

const HEROKU = {
    TABLE: {
        USERPROFILE: `public."TB_USERPROFILE"`,
        WITHDRAW: `public."TB_WITHDRAW"`,
        DAILYSLP: `public."TB_DAILYSLP"`
    },
    QUERY: {
        SELECT: {
            USERPROFILE: `SELECT * FROM public."TB_USERPROFILE"`,
            DAILYSLP: `SELECT * FROM public."DAILYSLP"`,
            WITHDRAW: `SELECT * FROM public."TB_WITHDRAW"`,
            MANAGEREARNED: `SELECT * FROM public."TB_MANAGEREARNED"`,
            YESTERDAYSLP: `SELECT * FROM public."TB_YESTERDAYSLP"`
        },
        INSERT: {
            USERPROFILE: `INSERT INTO public."TB_USERPROFILE"`,
            DAILYSLP: `INSERT INTO public."TB_DAILYSLP"`,
            WITHDRAW: `INSERT INTO public."TB_WITHDRAW"`,
            MANAGEREARNED: `INSERT INTO public."TB_MANAGEREARNED"`,
            YESTERDAYSLP: `INSERT INTO public."TB_YESTERDAYSLP"`
        },
        UPDATE: {
            USERPROFILE: `UPDATE public."TB_USERPROFILE"`,
            DAILYSLP: `UPDATE public."TB_DAILYSLP"`
        },
        DELETE: {
            YESTERDAYSLP: `DELETE FROM public."TB_YESTERDAYSLP"`
        }
    }
}

const DB4FREE = {
    TABLE: {
        USERPROFILE: "TB_USERPROFILE",
        WITHDRAW: "TB_WITHDRAW",
        DAILYSLP: "TB_DAILYSLP"
    },
    QUERY: {
        SELECT: {
            USERPROFILE: `SELECT * FROM TB_USERPROFILE`,
            DAILYSLP: `SELECT * FROM DAILYSLP`,
            WITHDRAW: `SELECT * FROM TB_WITHDRAW`,
            MANAGEREARNED: `SELECT * FROM TB_MANAGEREARNED`,
            YESTERDAYSLP: `SELECT * FROM TB_YESTERDAYSLP`
        },
        INSERT: {
            USERPROFILE: `INSERT INTO TB_USERPROFILE`,
            DAILYSLP: `INSERT INTO TB_DAILYSLP`,
            WITHDRAW: `INSERT INTO TB_WITHDRAW`,
            MANAGEREARNED: `INSERT INTO TB_MANAGEREARNED`,
            YESTERDAYSLP: `INSERT INTO TB_YESTERDAYSLP`
        },
        UPDATE: {
            USERPROFILE: `UPDATE TB_USERPROFILE`,
            DAILYSLP: `UPDATE TB_DAILYSLP`
        },
        DELETE: {
            YESTERDAYSLP: `DELETE FROM TB_YESTERDAYSLP`
        }
    }
}

// Export the function
module.exports = {
    APIURI,
    ISDEVLOGGER,
    LOGTAIL,
    MESSAGE,
    TABLES,
    HEROKU,
    DB4FREE
};