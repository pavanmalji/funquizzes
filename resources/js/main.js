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
    quiz: 'resources/fragments/quiz.txt',
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
    currentPageMessage: ko.observable(message),
    activeQuizzes: ko.observable([]),
    selectedQuiz: ko.observable([]),
    quizData: ko.observable([]),
    
    joinQuiz: function(data, event) {
        viewModel.selectedQuiz(data);

        var postData = {
            joinquiz:true,
            quiz: viewModel.selectedQuiz()
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if(data.length > 0) {
                                                        viewModel.quizData($.parseJSON(data));
                                                        viewModel.currentPageURL('quiz');
                                                    }                                       
                                                });
    }, 
    userAnswer: function(data) {
        console.log(data);
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

function ajaxPost(url, postParams) {
    $.ajax({
        url: url,
        cache: false,
        type: 'POST',
        context: document.body,
        data: { "": JSON.stringify(postParams) },
        dataType: "json",
        success: function (data) {
            user.userquizid = userquizid;
            setSessionUser();
            self.joinquizMessage("Quiz Joined Successfully : " + user.userquizid);
            self.joinquizMessageCSS(getMessageCSS("SUCCESS"));
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            var message = err.hasOwnProperty("ExceptionMessage") ? err.ExceptionMessage : messageMap['ERR_CONNECTION'];
            self.joinquizMessage(message);
            self.joinquizMessageCSS(getMessageCSS("ERROR"));
        },
        complete: function (xhr, status, error) {
            self.joinquizEnable(true);
            self.joinquizValue(joinquizValue);
        }
    });
}
        

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
