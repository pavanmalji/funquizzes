var user = {
    "_id": "0",
    "username": "anonymous",
    "password": "********",
    "email": "",
    "nickname": "Guest",
    "sessionToken": "00000000-0000-0000-0000-000000000000",
    "state": "inplay",
    "userquizid": "00000000-0000-0000-0000-000000000000"
};

var quiz = {
    "_id": "0",
    "name": "",
    "quizmaster": "",
    "questionids": []
}


var userstates = [
                    { name: "loginregister", fragment: "login-register.txt", nextstate: "joinquiz", prevstate: "loginregister" },
                    { name: "joinquiz", fragment: "join-quiz.txt", nextstate: "startgame", prevstate: "startgame" },
                    { name: "inplay", fragment: "in-play.txt", nextstate: "exitquiz", prevstate: "joinquiz" }
];

var messageMap = {
    "ERR_CONNECTION": "No response received. Please try again later."
}

var messageTypeCSSMap = [
    {name: "INFO", css: "alert-box radius"},
    {name: "SUCCESS", css: "alert-box success radius"},
    {name: "ERROR", css: "alert-box alert radius"}
]

var defaultstate = "loginregister";
var defaultpage = "login-register.txt";
var usercookie = "quizuser";

function getURL(url) {
    if (document.location.href.indexOf("http://localhost") == 0)
        return "/homebrewservices" + url;
    return url;
}

function getSessionUser() {
    if ($.cookie(usercookie))
        return JSON.parse($.cookie(usercookie));

    return user;
}

function setSessionUser() {
    if (user._id !== "0") {
        $.cookie(usercookie, JSON.stringify(user), { path: '/' });
    } else {
        user = getSessionUser();
    }
}

function deleteSessionUser() {
    $.cookie(usercookie, null, { path: '/' });
}

function getNextState(state) {
    var nextstate = defaultstate;
    $.each(userstates, function(key, item) {
        if (state == item.name) {
            nextstate = item.nextstate;
        }
    });

    return nextstate;
}

function getStatePage(state) {
    var statepage = defaultpage;

    $.each(userstates, function (key, userstate) {
        if (userstate.name == state) {
            statepage = userstate.fragment;
        }
    });

    return statepage;
}

function changeUserState() {
    user.state = getNextState(user.state);
}

function updateUser(userdata) {
    $.each(user, function (key, item) {
        if (userdata.hasOwnProperty(key)) {
            user[key] = userdata[key];
        }
    });
}


function getMessageCSS(messageType) {
    var messageCSS = "alert-box radius";
    $.each(messageTypeCSSMap, function (key, item) {
        if (messageType == item.name) {
            messageCSS = item.css;
        }
    });

    return messageCSS;
}

function applyKOBindings(KOBindingCallback) {
    ko.cleanNode($("#page-content")[0]);
    setTimeout(KOBindingCallback, 100);
}


function loadPage() {
    setSessionUser();

    var page = getStatePage(user.state);

    $.get(page, function (data) {
        $("#page-content").html(data);
        applyKOBindings(user.state + "KOBindingCallback()");
    });
}
