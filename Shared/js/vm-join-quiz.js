// Using Knockout.js JoinQuizModel
// (c) Pavan Malji - http://facebook.com/pavanmalji
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

var getallquizesURL = getURL("/api/quiz/game/quizes");
var joinquizURL = getURL("/api/quiz/game/joinquiz");

function joinquizKOBindingCallback() {
    ko.applyBindings(new JoinQuizViewModel());
}

function JoinQuizViewModel() {

    var self = this;

    self.availableQuizes = ko.observableArray([]);
    self.selectedQuizId = ko.observable();
    self.joinquizMessage = ko.observable();
    self.joinquizMessageCSS = ko.observable();
    self.joinquizEnable = ko.observable(false);
    self.joinquizValue = ko.observable("Loading Quizes...");


    self.joinquiz = function () {

        $.each(self.availableQuizes(), function (index, obj) {
            if (obj._id == self.selectedQuizId()) {
                quiz = obj;
            }
        });

        var quizuserdata = {
            'userId': user._id,
            'quizId': quiz._id
        };
    
        self.joinquizEnable(false);
        var joinquizValue = self.joinquizValue();
        self.joinquizValue("Please Wait...");
    
        $.ajax({
            url: joinquizURL,
            cache: false,
            type: 'POST',
            context: document.body,
            data: { "": JSON.stringify(quizuserdata) },
            dataType: "json",
            success: function (userquizid) {
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
    };


    loadAllQuizes(self);
}

function loadAllQuizes(self) {
    $.ajax({
        url: getallquizesURL,
        cache: false,
        type: 'GET',
        context: document.body,
        dataType: "json",
        success: function (data) {
            quizes = data;
            self.joinquizValue("Join Quiz");
            self.joinquizEnable(true);
            self.availableQuizes(data);
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            var message = err.hasOwnProperty("ExceptionMessage") ? err.ExceptionMessage : messageMap['ERR_CONNECTION'];
            self.joinquizMessage(message);
            self.joinquizMessageCSS(getMessageCSS("ERROR"));
            self.joinquizValue("Join Quiz");
            self.joinquizEnable(false);

        },
        complete: function (xhr, status, error) {
            $("#page-content").foundation();
        }
    });
}