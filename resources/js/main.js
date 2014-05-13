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

function getRandomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var pages = {
    home: 'resources/fragments/home.txt',
    profile: 'resources/fragments/profile.txt',
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

function quizQuestionAnswer(_id, category, question, answer, choices) {
    return {
        _id: ko.observable(_id),
        category: ko.observable(category),
        question: ko.observable(question),
        answer: ko.observable(answer),
        choices: ko.observableArray([]),
        
        addChoice: function() {
            console.log(this.choices.push('Hello'));
        },
        removeChoice: function() {
            conole.log("removeChoice");
            console.log(this);
        }
    };
}

var viewModel = {
    _dummyObservable: ko.observable(),
    sessionUser: ko.observable([]),
    currentPageURL: ko.observable('home'),
    currentPageMessage: ko.observable(message),
    
    newQuizQuestionAnswer: ko.observable(new quizQuestionAnswer("Will be generated.")),
    quizQuestionsAnswers: ko.observableArray([]),
    loadQuestionsAnswers: function() {
        
    },
    addQuestionAnswer: function() {
        var choices = [];
        if(viewModel._dummyObservable().choice1 !== '') {
            choices.push(viewModel._dummyObservable().choice1);
        }
        if(viewModel._dummyObservable().choice2 !== '') {
            choices.push(viewModel._dummyObservable().choice2);
        }
        if(viewModel._dummyObservable().choice3 !== '') {
            choices.push(viewModel._dummyObservable().choice3);
        }
        if(viewModel._dummyObservable().choice4 !== '') {
            choices.push(viewModel._dummyObservable().choice4);
        }
        
        var postData = {
            addquestionanswer:true,
            questionAnswer: viewModel.newQuizQuestionAnswer()
        };
        
        delete(postData.questionAnswer._id);
        
        console.log(postData);
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    console.log(data);                                    
                                                });
        
    },
    addChoiceToQuestionAnswer: function(data, event) {
        viewModel.newQuizQuestionAnswer().addChoice(data);
    },  
    removeChoiceFromQuestionAnswer: function(data, event) {
        console.log(data);
    },
    activeQuizzes: ko.observable([]),
    selectedQuiz: ko.observable([]),
    quizData: ko.observable([]),
    currentQuestionAnswer: ko.observable([]),
    quizUserData: ko.observable([]),
    
    joinQuiz: function(data, event) {
        viewModel.selectedQuiz(data);

        var postData = {
            joinquiz:true,
            quiz: viewModel.selectedQuiz()
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if(data.length > 0) {
                                                        var dataArr = $.parseJSON(data);
                                                        var quizUserDataObj = dataArr[0];
                                                        quizUserDataObj['userAnswers'] = [];
                                                        viewModel.quizUserData(quizUserDataObj);
                                                        viewModel.quizData(dataArr[1].sort(function() {return 0.5 - Math.random()}));
                                                        viewModel.currentQuestionAnswer(viewModel.quizData()[0]);
                                                        viewModel.currentPageURL('quiz');
                                                    }                                       
                                                });
    }, 
    userAnswer: function(data, event) {
        
        var userAnswer = {
                            questionId : viewModel.currentQuestionAnswer()._id,
                            answer: data,
                            isCorrect: (data === viewModel.currentQuestionAnswer().answer)
                         };
                    
        viewModel.quizUserData().userAnswers.push(userAnswer);
        
        var postData = {
            saveuseranswer: true,
            quizUserData: viewModel.quizUserData()
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if(data.length > 0) {
                                                        var data = $.parseJSON(data);
                                                        var nextQuestionIndex = viewModel.quizUserData().userAnswers.length;
                                                        if(nextQuestionIndex < viewModel.quizData().length) {
                                                            viewModel.currentQuestionAnswer(viewModel.quizData()[nextQuestionIndex]);
                                                        } else {
                                                            viewModel.currentQuestionAnswer(null);
                                                            viewModel._dummyObservable('Dummy to force computed value refresh.');
                                                        }
                                                    }                                       
                                                });
    },
    choicesAfterRender: function() { 
        $('#choices').hide(); $('#choices').slideDown(200); 
    }
};

viewModel.currentPageURL().loadPage = ko.dependentObservable(function() {
    $.get(pages[viewModel.currentPageURL()], function (data) {
        $('#page-content').hide().html(data).fadeIn(300);
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

viewModel.quizResult = ko.computed(function() {
        var total = this.quizData().length;
        var correct = 0;
        var wrong = 0;
        var notanswered = 0;
        var temp = viewModel._dummyObservable();
        
        if(this.quizUserData().userAnswers !== undefined) {
            $.each(this.quizUserData().userAnswers, function( index, userAnswer ) {
                console.log(index);
                console.log(userAnswer);
                if(userAnswer['isCorrect'] === true) {
                    correct++;
                } else {
                    wrong++;
                }
            });
        }
        
        notanswered = total - (correct + wrong);
        
        return {
                    total:  total ,
                    correct: correct,
                    wrong: wrong,
                    notanswered: notanswered
               };
                  
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
