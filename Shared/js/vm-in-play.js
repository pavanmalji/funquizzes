// Using Knockout.js JoinQuizModel
// (c) Pavan Malji - http://facebook.com/pavanmalji
// License: MIT (http://www.opensource.org/licenses/mit-license.php)


function inplayKOBindingCallback() {
    ko.applyBindings(new InPlayViewModel());
}

function InPlayViewModel() {

    var self = this;

    self.inplayQuizName = ko.observable("BSS Section Meeting Quiz");

    self.inplayMessage = ko.observable();
    self.inplayMessageCSS = ko.observable();
    self.inplayEnable = ko.observable(false);
    self.inplayValue = ko.observable("Loading Quizes...");
    self.selectedAnswer = ko.observable();

    self.questionanswers = ko.observable(
                                            {
                                                "_id": "231a9be8a4b0446b2349e9a0",
                                                "category": "Geography",
                                                "question": "What is the capital of a",
                                                "answer": "aa",
                                                "choices": ["aa", "bb", "cc", "dd"]
                                            }
                                        );

    self.initFoundation = function () {
        $("#page-content").foundation();
    };

    self.inplaySubmitAnswer = function () {
    };
    self.inplaySubmitAnswerEnable = ko.observable(true);
    self.inplaySubmitAnswerValue = ko.observable("Submit");

    self.inplaySkipQuestion = function () {
    };
    self.inplaySkipQuestionEnable = ko.observable(true);
    self.inplaySkipQuestionValue = ko.observable("Skip");
}



