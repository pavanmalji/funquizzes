// (c) Pavan Malji - http://facebook.com/pavanmalji
// Date: 2014-04-23
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

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
    activeQuizzes: ko.observable([]),
    currentPageURL: ko.observable('home'),
    currentPage: ko.observable(''),
    currentPageMessage: ko.observable(message),
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
    var provider = $(this).attr('href');
    window.location = authURLS[provider].login;
});

$(document).on( "click", ".logout", function(e) {
    e.preventDefault();
    
    var provider = viewModel.sessionUser().provider;
    window.location = authURLS[provider].logout;
});

function getActiveQuizzes() {
    $.get( "utils/quizinfo.php?activequizzes", function( data ) {
            if(data.length > 0) {
                viewModel.activeQuizzes($.parseJSON(data));
            }
    });
}

function postPageLoad() {
    switch(viewModel.currentPageURL()) {
        case 'player' : getActiveQuizzes();
            break;
    }
}

function initAuthURLS() {
    for(provider in authURLS) {
        $.get( "utils/authinfo.php?" + provider + "&authurls", function( data ) {
            if(data.length > 0) {
                data = $.parseJSON(data);
                authURLS[data.provider].login = data.login;
                authURLS[data.provider].logout = data.logout;
            }
        });
    }
}

function initApp() {
    initAuthURLS();
    ko.applyBindings(viewModel);
}
