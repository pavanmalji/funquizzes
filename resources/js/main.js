// (c) Pavan Malji - http://facebook.com/pavanmalji
// Date: 2014-04-23
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

var sessioncookie = 'sessioncooky';
function cooky(providerKey) {
    return {
        provider: providerKey,
        modifiedAt: Math.round((new Date()).getTime()/1000)
    };
}

function getSessionCookie() {
    var cookieInfo = $.cookie(sessioncookie);
    if (cookieInfo)
        return JSON.parse(cookieInfo);

    return null;
}

function setSessionCookie(cookieInfo) {
    $.cookie(sessioncookie, JSON.stringify(cookieInfo), { path: '/' });
}

function deleteSessionCookie() {
    $.cookie(sessioncookie, null, { path: '/' });
}


var pages = {
    home: 'resources/fragments/home.txt',
    about: 'resources/fragments/about.txt',
    contact: 'resources/fragments/contact.txt',
    player: 'resources/fragments/player.txt',
    quizmaster: 'resources/fragments/quizmaster.txt'
};

var authURLS = {
    gplus : {
            login: '', 
            logout: ''
        }, 
     fb : {
            login: '', 
            logout: ''
        }
};

var messageMap = {
    home_start : ['Welcome to Fun Quizzes.', 'alert alert-info'],
    login_success : ['You have logged in successfully.', 'alert alert-success'],
    login_error : ['There was an error during login. Please try again.', 'alert alert-danger'],
    logout_success : ['Thank you. Hope to see you again.', 'alert alert-info'],
    warning: ['Dummy Warning', 'alert alert-warning']
};

var message = {
    showMessage: ko.observable(false),
    displayText: ko.observable(''),
    displayStyle: ko.observable('')
};

var viewModel = {
    sessionUser: ko.observable([]),
    currentPageURL: ko.observable('home'),
    currentPage: ko.observable(''),
    currentPageMessage: ko.observable(message),
    activeQuizzes: ko.observable([]),
    joinQuiz: function(data, event) {
        alert(data._id);
    }
};

viewModel.currentPageURL().loadPage = ko.dependentObservable(function() {
        $.get(pages[viewModel.currentPageURL()], function (data) {
            $('#page-content').html(data);
            var pagecontent = $('#page-content')[0]; 
            ko.cleanNode(pagecontent);
            ko.applyBindings(viewModel, pagecontent);
            
            postPageLoad();
            
            if(viewModel.sessionUser().length === 0 || viewModel.sessionUser()._id === '000000000000000000000000') {
                $.get( "utils/authinfo.php?user", function( data ) {
                    if(data.length > 0) {
                        viewModel.sessionUser($.parseJSON(data));
                        setSessionCookie(new cooky(viewModel.sessionUser().provider));
                    }
                });
            }
        });
}, viewModel);

$(document).on( "click", ".page-link", function(e) {
    e.preventDefault();
    viewModel.currentPageMessage().showMessage(false);
    viewModel.currentPageURL($(this).attr('href'));
});

$(document).on( "click", ".login", function(e) {
    e.preventDefault();
    var providerKey = $(this).attr('href');
    window.location = authURLS[providerKey].login;
});

$(document).on( "click", ".logout", function(e) {
    e.preventDefault();
    
    var providerKey = viewModel.sessionUser().provider;
    deleteSessionCookie();
    window.location = authURLS[providerKey].logout;
});

function getActiveQuizzes() {
    $.get( "utils/quizinfo.php?activequizzes", function( data ) {
            if(data.length > 0) {
                viewModel.activeQuizzes($.parseJSON(data));
            }
    });
}

function postPageLoad() {
    if(!isSessionAlive() && !isAnonymousSession()) {
        var index = getSessionCookie().provider;
        deleteSessionCookie();
        if(authURLS[index].logout !== '') {
            window.location = authURLS[index].logout;
        }
    }
    
    switch(viewModel.currentPageURL()) {
        case 'player' : getActiveQuizzes();
            break;
    }
}

function initAuthURLS() {
    for(var providerKey in authURLS) {
        $.get( "utils/authinfo.php?" + providerKey + "&authurls", function( data ) {
            if(data.length > 0) {
                data = $.parseJSON(data);
                authURLS[data.provider].login = data.login;
                authURLS[data.provider].logout = data.logout;
            }
        });
    }
}

function isSessionAlive() {
    var sessionInfo = getSessionCookie();
    
    var SESSION_ALIVE_TIME = 1800; //in seconds -30 mins
    var now = Math.round((new Date()).getTime()/1000);
    
    if(Math.abs(now - sessionInfo.modifiedAt) < SESSION_ALIVE_TIME) {
        return true;
    }
    
    return false;
}

function isAnonymousSession() {
    if(getSessionCookie().provider === 'none') {
        return true;
    } else {
        return false;
    }
}


function initSessionCookie() {
    var sessionInfo = getSessionCookie();
    
    if(sessionInfo === null) {
        setSessionCookie(new cooky('none'));
    }
}

function initApp() {
    initSessionCookie();
    initAuthURLS();
    ko.applyBindings(viewModel);
}
