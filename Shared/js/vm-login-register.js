// Using Knockout.js LoginModel
// (c) Pavan Malji - http://facebook.com/pavanmalji
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

var loginURL = getURL("/api/quiz/game/login");
var registerURL = getURL("/api/quiz/game/register");

function loginregisterKOBindingCallback() {
    ko.applyBindings(new LoginRegisterViewModel());
}

function LoginRegisterViewModel() {

    var self = this;

    self.loginUserid = ko.observable();
    self.loginPassword = ko.observable();
    self.loginMessage = ko.observable();
    self.loginMessageCSS = ko.observable();
    self.loginEnable = ko.observable(true);
    self.loginValue = ko.observable("Login");


    self.registerUserid = ko.observable();
    self.registerPassword = ko.observable();
    self.registerConfirmpassword = ko.observable();
    self.registerNickname = ko.observable();
    self.registerEmail = ko.observable();
    self.registerMessage = ko.observable();
    self.registerMessageCSS = ko.observable();
    self.registerEnable = ko.observable(true);
    self.registerValue = ko.observable("Register");

    self.showLogin = function () {
        $("#register").hide("fast", function () {
            $("#login").show('fast');
        });
    };

    self.showRegister = function () {
        $("#login").hide("fast", function () {
            $("#register").show('fast');
        });
    };


    self.login = function () {
        var userlogindata = {
            '_id': '0',
            'username': self.loginUserid(),
            'password': self.loginPassword()
        };

        self.loginEnable(false);
        var loginValue = self.loginValue();
        self.loginValue("Please Wait...");

        $.ajax({
            url: loginURL,
            cache: false,
            type: 'POST',
            context: document.body,
            data: userlogindata,
            dataType: "json",
            success: function (data) {
                updateUser(data);
                changeUserState();
                loadPage();
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                var message = err.hasOwnProperty("ExceptionMessage") ? err.ExceptionMessage : messageMap['ERR_CONNECTION'];
                self.loginMessage(message);
                self.loginMessageCSS(getMessageCSS("ERROR"));
            },
            complete: function (xhr, status, error) {
                self.loginEnable(true);
                self.loginValue(loginValue);
            }
        });
    };

    self.register = function () {
        var userregdata = {
            "_id": "0",
            "username": self.registerUserid(),
            "password": self.registerPassword(),
            "email": self.registerEmail(),
            "nickname": self.registerNickname()
        }

        self.registerEnable(false);
        var registerValue = self.registerValue();
        self.registerValue("Please Wait...");

        $.ajax({
            url: registerURL,
            cache: false,
            type: 'POST',
            context: document.body,
            data: userregdata,
            dataType: "json",
            success: function (data) {
                updateUser(data);
                changeUserState();
                loadPage();
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                self.registerMessage(err.ExceptionMessage);
                self.registerMessageCSS(getMessageCSS("ERROR"));
            },
            complete: function (xhr, status, error) {
                self.registerEnable(true);
                self.registerValue(registerValue);
            }
        });
    };
}

