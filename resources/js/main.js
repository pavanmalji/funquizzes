// (c) Pavan Malji - http://facebook.com/pavanmalji
// Date: 2014-04-23
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

var pages = {
    home: 'resources/fragments/home.txt',
    about: 'resources/fragments/about.txt',
    contact: 'resources/fragments/contact.txt'
};

var messageMap = {
    home_start : ['Welcome to Fun Quizzes.', 'alert alert-info'],
    login_success : ['You have logged in successfully.', 'alert alert-success'],
    login_error : ['There was an error during login. Please try again.', 'alert alert-danger'],
    warning: ['Dummy Warning', 'alert alert-warning']
};

var message = {
    showMessage: ko.observable(true),
    displayText: ko.observable(messageMap['home_start'][0]),
    displayStyle: ko.observable(messageMap['home_start'][1])
};

var user = {
    provider: ko.observable(''),
    accessToken: ko.observable(''),
    id: ko.observable(''),
    displayname: ko.observable(''),
    email: ko.observable(''),
    profileImage: ko.observable(''),
    urlLoginGplus: ko.observable(''),
    urlLogoutGplus: ko.observable('')
};

var viewModel = {
    sessionUser: ko.observable(user),
    currentPageURL: ko.observable('home'),
    currentPage: ko.observable(''),
    currentPageMessage: ko.observable(message)
};

viewModel.sessionUser().isLoggedIn = ko.dependentObservable(function() {
        return (this.sessionUser().accessToken() !== "");
}, viewModel);

viewModel.currentPageURL().loadPage = ko.dependentObservable(function() {
        $.get(pages[this.currentPageURL()], function (data) {
            $('#page-content').html(data);
            var pagecontent = $('#page-content')[0]; 
            ko.cleanNode(pagecontent);
            ko.applyBindings(viewModel, pagecontent);
            getSessionData();
        });
}, viewModel);

function updateSessionUserData(data) {
    user.provider(data.provider);
    user.accessToken(data.access_token);
    user.id(data.id);
    user.displayname(data.displayname);
    user.email(data.email);
    user.profileImage(data.profile_image);
    
    if(data.provider === "gplus") {
        user.urlLoginGplus(data.url_login);
        user.urlLogoutGplus(data.url_logout);
    }
}

function getSessionData() {
    $.ajax({
        url: 'utils/login-gateway.php',
        cache: false,
        type: 'GET',
        context: document.body,
        dataType: "json",
        success: function(data) {
            updateSessionUserData(data);
        },
        error: function(xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
//            var message = err.hasOwnProperty("ExceptionMessage") ? err.ExceptionMessage : messageMap['ERR_CONNECTION'];
//            self.joinquizMessage(message);
//            self.joinquizMessageCSS(getMessageCSS("ERROR"));
            console.log(err);
        },
        complete: function(xhr, status, error) {
//            self.joinquizEnable(true);
//            self.joinquizValue(joinquizValue);
        }
    });
}

$('.page-link').click(function(e){
    e.preventDefault();
    viewModel.currentPageMessage().showMessage(false);
    viewModel.currentPageURL($(this).attr('href'));
});

function initApp() {
    ko.applyBindings(viewModel);
}
