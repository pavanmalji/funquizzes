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
    home: ['', 'resources/fragments/home.txt'],
    profile: ['Profile Information', 'resources/fragments/profile.txt'],
    help: ['Help', 'resources/fragments/help.txt'],
    comments: ['Comments', 'resources/fragments/comments.txt'],
    dashboardallquizzes: ['Dashboard - Select Quiz', 'resources/fragments/dashboardallquizzes.txt'],
    dashboardquizresults: ['Dashboard - Results', 'resources/fragments/dashboardquizresults.txt'],
    playersection: ['Player - Select/Join Quiz ', 'resources/fragments/playersection.txt'],
    playerplayquiz: ['Player - Play Quiz', 'resources/fragments/playerplayquiz.txt'],
    playerresults: ['Player - Results', 'resources/fragments/playerresults.txt'],
    quizmastersection: ['Quiz Master - Section', 'resources/fragments/quizmastersection.txt'],
    quizmasteraddquestions: ['Quiz Master - Add Questions', 'resources/fragments/quizmasteraddquestions.txt'],
    quizmastercreatequiz: ['Quiz Master - Create Quiz', 'resources/fragments/quizmastercreatequiz.txt']
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
    warning: ['Dummy Warning', 'alert alert-warning'],
    question_add_wait: ['Adding Question. Please Wait.', 'alert alert-info'],
    question_add_success: ['Question added successfully', 'alert alert-success'],
    question_add_error: ['Error adding question.', 'alert alert-danger'],
    user_answers_save_error: ['Error saving answer. Please try again.', 'alert alert-warning'],
    quiz_create_wait: ['Creating quiz. Please Wait.', 'alert alert-info'],
    quiz_create_success: ['Quiz created successfully', 'alert alert-success'],
    quiz_create_error: ['Error creating quiz.', 'alert alert-danger'],
    quiz_update_wait: ['Updating quiz. Please Wait.', 'alert alert-info'],
    quiz_update_success: ['Quiz updated successfully', 'alert alert-success'],
    quiz_update_error: ['Error updating quiz.', 'alert alert-danger'],
    quiz_join_wait: ['Joining quiz. Please Wait.', 'alert alert-info'],
    quiz_join_error_pin_incorrect: ['Error joining quiz. Pin Incorrect.', 'alert alert-danger'],
    quiz_join_error: ['Error joining quiz. Please try again.', 'alert alert-danger'],
    user_comment_add_error: ['Error adding comment. Please try again.', 'alert alert-danger']
};

var message = {
    showMessage: ko.observable(false),
    displayText: ko.observable(''),
    displayStyle: ko.observable('')
    
};

function quiz() {
    return {
        name: ko.observable(),
        description: ko.observable(),
        questionids: ko.observableArray([])
    };
}

function quizAnswerChoice(choice) {
    return {
        choice: choice,
        removeChoice: function() {
            viewModel.crudQuizQuestionAnswer().choices.remove(this);
        }
    };
}

function quizQuestionAnswer(_id, tags, question, answer, choices) {
    return {
        _id: ko.observable(_id),
        tags: ko.observable(tags),
        question: ko.observable(question),
        answer: ko.observable(answer),
        choices: ko.observableArray([new quizAnswerChoice(''), new quizAnswerChoice('')]),
        
        addChoice: function() {
            viewModel.crudQuizQuestionAnswer().choices.push(new quizAnswerChoice(''));
        }
    };
}

var viewModel = {
    _dummyObservable: ko.observable(),
    sessionUser: ko.observable([]),
    currentPageURL: ko.observable('home'),
    currentPageTitle: ko.observable('Fun Quizzes'),
    currentPageMessage: ko.observable(message),
    
    quizQuestionsAnswers: ko.observableArray([]),
    hasMoreQuestionsAnswers: ko.observable(true),
    crudQuizQuestionAnswer: ko.observable(new quizQuestionAnswer("Will be generated.")),
    
    addQuestionAnswer: function() {      
        viewModel.currentPageMessage().showMessage(true);
        viewModel.currentPageMessage().displayText(messageMap['question_add_wait'][0]);
        viewModel.currentPageMessage().displayStyle(messageMap['question_add_wait'][1]);

        var choices = [];
        
        $.each(viewModel.crudQuizQuestionAnswer().choices(), function( index, item ) {
            choices.push(item.choice);
        });

        var postData = {
            addquestionanswer:true,
            questionAnswer: {
                tags: viewModel.crudQuizQuestionAnswer().tags(),
                question: viewModel.crudQuizQuestionAnswer().question(),
                answer: viewModel.crudQuizQuestionAnswer().answer(),
                choices: choices
            }
        };

        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if (data._id !== undefined) {
                                                        viewModel.currentPageMessage().displayText(messageMap['question_add_success'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['question_add_success'][1]);
                                                    } else {
                                                        viewModel.currentPageMessage().displayText(messageMap['question_add_error'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['question_add_error'][1]);
                                                    }
                                                });
        
    },
    
    crudQuiz: ko.observable(new quiz()),
    createQuiz: function() {
        viewModel.currentPageMessage().showMessage(true);
        viewModel.currentPageMessage().displayText(messageMap['quiz_create_wait'][0]);
        viewModel.currentPageMessage().displayStyle(messageMap['quiz_create_wait'][1]);
        
        var questionids = [];
        
        $.each(viewModel.crudQuiz().questionids(), function( index, item ) {
            questionids.push(item);
        });
        
        var postData = {
            createquiz:true,
            quiz: {
                    name: viewModel.crudQuiz().name(),
                    description: viewModel.crudQuiz().description(),
                    questionids: questionids
            }
        };
  
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if (data._id !== undefined) {
                                                        viewModel.currentPageMessage().displayText(messageMap['quiz_create_success'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['quiz_create_success'][1]);
                                                    } else {
                                                        viewModel.currentPageMessage().displayText(messageMap['quiz_create_error'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['quiz_create_error'][1]);
                                                    }
                                                });
    },
    allquizzes: ko.observableArray([]),
    hasMoreQuizzes: ko.observable(true),
    activeQuizzes: ko.observableArray([]),
    hasMoreActiveQuizzes: ko.observable(true),
    createdQuizzes: ko.observableArray([]),
    hasMoreCreatedQuizzes: ko.observable(true),
    selectedQuiz: ko.observable([]),
    quizData: ko.observable([]),
    currentQuestionAnswer: ko.observable([]),
    quizUserData: ko.observable([]),
    quizUsers: ko.observable([]),
    showQuizResults: function(data, event) {
        viewModel.selectedQuiz(data);
        viewModel.currentPageURL('dashboardquizresults');
    },
    updateQuiz: function(data, event) {
        viewModel.currentPageMessage().showMessage(true);
        viewModel.currentPageMessage().displayText(messageMap['quiz_update_wait'][0]);
        viewModel.currentPageMessage().displayStyle(messageMap['quiz_update_wait'][1]);
        
        data.pin = $('#' + data._id).val();
        
        var postData = {
            updatequiz: true,
            quiz : data
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if(data !== undefined) {
                                                        viewModel.currentPageMessage().displayText(messageMap['quiz_update_success'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['quiz_update_success'][1]);
                                                    } else {
                                                        // ToDo: Error updating quiz
                                                        viewModel.currentPageMessage().displayText(messageMap['quiz_update_error'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['quiz_update_error'][1]);
                                                    }                                      
                                                });
    },
    joinQuiz: function(data, event) {
        viewModel.currentPageMessage().showMessage(true);
        viewModel.currentPageMessage().displayText(messageMap['quiz_join_wait'][0]);
        viewModel.currentPageMessage().displayStyle(messageMap['quiz_join_wait'][1]);
        
        
        if(data.pin !== $.md5($('#'+data._id).val())) {
            viewModel.currentPageMessage().displayText(messageMap['quiz_join_error_pin_incorrect'][0]);
            viewModel.currentPageMessage().displayStyle(messageMap['quiz_join_error_pin_incorrect'][1]);
        } else {
            viewModel.selectedQuiz(data);

            var postData = {
                joinquiz:true,  
                quiz: viewModel.selectedQuiz()
            };

            $.post("utils/quizinfo.php", postData,  function(data, status){
                                                        if(data !== undefined && data.length > 0) {
                                                            var quizUserDataObj = data[0];
                                                            quizUserDataObj['userAnswers'] = [];
                                                            quizUserDataObj['correct'] = 0;
                                                            quizUserDataObj['wrong'] = 0;
                                                            quizUserDataObj['total'] = data[1].length;
                                                            viewModel.quizUserData(quizUserDataObj);
                                                            viewModel.quizData(data[1].sort(function() {return 0.5 - Math.random();}));
                                                            viewModel.currentQuestionAnswer(viewModel.quizData()[0]);
                                                            viewModel.currentPageURL('playerplayquiz');                                                            
                                                        } else {
                                                            viewModel.currentPageMessage().displayText(messageMap['quiz_join_error'][0]);
                                                            viewModel.currentPageMessage().displayStyle(messageMap['quiz_join_error'][1]);
                                                        }                                      
                                                    });
        }
    }, 
    userAnswer: function(data, event) {
        viewModel.currentPageMessage().showMessage(false);
        
        var userAnswer = {
                            questionId : viewModel.currentQuestionAnswer()._id,
                            answer: data,
                            isCorrect: (data === viewModel.currentQuestionAnswer().answer)
                         };
                         
        $('#choices .btn').addClass('disabled');
        $('#main-panel').removeClass('panel-default');
        $('#main-panel').addClass(userAnswer.isCorrect ? 'panel-success' : 'panel-danger');
                    
        viewModel.quizUserData().userAnswers.push(userAnswer);
        viewModel.quizUserData().correct = viewModel.quizUserData().correct + (userAnswer.isCorrect ? 1 : 0);
        viewModel.quizUserData().wrong = viewModel.quizUserData().wrong + (userAnswer.isCorrect ? 0 : 1);
        
        // ToDo: Update numbers with KO binding
        $('#correct').html(viewModel.quizUserData().correct);
        $('#wrong').html(viewModel.quizUserData().wrong);
        $('#remaining').html(viewModel.quizUserData().total - (viewModel.quizUserData().correct + viewModel.quizUserData().wrong));
        
        var postData = {
            saveuseranswer: true,
            quizUserData: viewModel.quizUserData()
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if(data !== undefined) {
                                                        var nextQuestionIndex = viewModel.quizUserData().userAnswers.length;
                                                        if(nextQuestionIndex < viewModel.quizData().length) {
                                                            viewModel.currentQuestionAnswer(viewModel.quizData()[nextQuestionIndex]);
                                                        } else {
                                                            viewModel.currentQuestionAnswer(null);
                                                            viewModel._dummyObservable('Dummy to force computed value refresh.');
                                                        }
                                                    } else {
                                                        viewModel.quizUserData().userAnswers.pop();
                                                        
                                                        viewModel.currentPageMessage().showMessage(true);
                                                        viewModel.currentPageMessage().displayText(messageMap['user_answers_save_error'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['user_answers_save_error'][1]);
                                                    }                                 
                                                }).fail(function(){
                                                    viewModel.quizUserData().userAnswers.pop();
                                                        
                                                    viewModel.currentPageMessage().showMessage(true);
                                                    viewModel.currentPageMessage().displayText(messageMap['user_answers_save_error'][0]);
                                                    viewModel.currentPageMessage().displayStyle(messageMap['user_answers_save_error'][1]);
                                                }).always(function(){
                                                    $('#choices .btn').removeClass('disabled');
                                                    $('#main-panel').removeClass(userAnswer.isCorrect ? 'panel-success' : 'panel-danger');
                                                    $('#main-panel').addClass('panel-default');
                                                });
    },
    choicesAfterRender: function() { 
        $('#choices').hide(); $('#choices').slideDown(200); 
    },       
    crudComment: ko.observable(),
    usersComments: ko.observableArray([]),
    hasMoreComments: ko.observable(true),
    addComment: function() {
        viewModel.currentPageMessage().showMessage(false);
        
        var postData = {
            addcomment: true,
            comment: viewModel.crudComment()
        };
        
        $.post("utils/quizinfo.php", postData,  function(data, status){
                                                    if (data._id !== undefined) {
                                                        // To Do : Add comment to the list of comments.
                                                        var userComment = {
                                                            _id: data._id,
                                                            comment: viewModel.crudComment(),
                                                            userId: viewModel.sessionUser()._id,
                                                            userInfo : {
                                                              name: viewModel.sessionUser().name,
                                                              picture: viewModel.sessionUser().picture,
                                                              link: viewModel.sessionUser().link
                                                            },
                                                            _createdAt : data._createdAt,
                                                            _updatedAt : data._createdAt,
                                                        };
                                                        viewModel.usersComments.unshift(userComment);
                                                        viewModel.crudComment('');
                                                    } else {
                                                        viewModel.currentPageMessage().showMessage(true);
                                                        viewModel.currentPageMessage().displayText(messageMap['user_comment_add_error'][0]);
                                                        viewModel.currentPageMessage().displayStyle(messageMap['user_comment_add_error'][1]);
                                                    }                                 
                                                });
    }
};

viewModel.currentPageURL().loadPage = ko.dependentObservable(function() {
    viewModel.currentPageMessage().showMessage(false);
    $.get(pages[viewModel.currentPageURL()][1] + '?_=' + (new Date().getTime()), function (data) {
        $('#page-content').hide().html(data).fadeIn(300);
        var pagecontent = $('#page-content')[0]; 
        ko.cleanNode(pagecontent);
        ko.applyBindings(viewModel, pagecontent);

        postPageLoad();
        
        if(viewModel.sessionUser().length === 0 || viewModel.sessionUser()._id === '000000000000000000000000') {
            $.get( "utils/authinfo.php?user", function( data ) {
                if(data !== undefined) {
                    viewModel.sessionUser(data);
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

viewModel.crudCommentLength = ko.computed(function() {
    var comment = viewModel.crudComment();
    return (comment === undefined) ? 0 : (comment.trim()).length;
}, viewModel);


$(document).on("click", ".navbar a.navbar-link", function(e) {
    var navbar_toggle = $('.navbar-toggle');
    if (navbar_toggle.is(':visible')) {
        navbar_toggle.trigger('click');
    }
    e.preventDefault();
    viewModel.currentPageMessage().showMessage(false);
    viewModel.currentPageURL($(this).attr('href'));
});

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

function getQuizUsers() {
    if(viewModel.currentPageURL() === 'dashboardquizresults') {
        $.get( "utils/quizinfo.php?quizusers&quizid=" + viewModel.selectedQuiz()._id, function( data ) {
            if(data !== undefined && data.length > 0) {
                viewModel.quizUsers(data);
                console.log(viewModel.currentPageURL());
                if(viewModel.currentPageURL() === 'dashboardquizresults') {
                   setTimeout(getQuizUsers(), 500);
                }
            } else {
            }  
            // ToDo: Error Loading Active Quizzes
        });
    }
}

function getAllQuizzes() {
    var limit = 5;
    var skip = viewModel.allquizzes().length;
    
    $.get( "utils/quizinfo.php?allquizzes&limit=" + limit + "&skip=" + skip, function( data ) {
            if(data !== undefined && data.length > 0) {
                viewModel.allquizzes(viewModel.allquizzes().concat(data));
                viewModel.hasMoreQuizzes(data.length === limit);
            } else {
                viewModel.hasMoreQuizzes(false);
            }  
            // ToDo: Error Loading Active Quizzes
    });
}

function getActiveQuizzes() {
    var limit = 5;
    var skip = viewModel.activeQuizzes().length;
    
    $.get( "utils/quizinfo.php?activequizzes&limit=" + limit + "&skip=" + skip, function( data ) {
            if(data !== undefined && data.length > 0) {
                viewModel.activeQuizzes(viewModel.activeQuizzes().concat(data));
                viewModel.hasMoreActiveQuizzes(data.length === limit);
            } else {
                viewModel.hasMoreActiveQuizzes(false);
            }  
            // ToDo: Error Loading Active Quizzes
    });
}

function getCreatedQuizzes() {
    var limit = 5;
    var skip = viewModel.createdQuizzes().length;
    
    $.get( "utils/quizinfo.php?createdquizzes&limit=" + limit + "&skip=" + skip, function( data ) {
            if(data !== undefined && data.length > 0) {
                viewModel.createdQuizzes(viewModel.createdQuizzes().concat(data));
                viewModel.hasMoreCreatedQuizzes(data.length === limit);
            } else {
                viewModel.hasMoreCreatedQuizzes(false);
            }
            // ToDo: Error Loading Created Quizzes
    });
}

function getQuestionsAnswers() {
    var limit = 5;
    var skip = viewModel.quizQuestionsAnswers().length;
    
    $.get( "utils/quizinfo.php?questionsanswers&limit=" + limit + "&skip=" + skip, function( data ) {
        if(data !== undefined && data.length > 0) {
            viewModel.quizQuestionsAnswers(viewModel.quizQuestionsAnswers().concat(data));
            viewModel.hasMoreQuestionsAnswers(data.length === limit);
        } else {
            viewModel.hasMoreQuestionsAnswers(false);
        }
        // ToDo: Error Loading Questions Answers
    }); 
}

function getComments() {
    var limit = 5;
    var skip = viewModel.usersComments().length;
    $.get( "utils/quizinfo.php?comments&limit=" + limit + "&skip=" + skip, function( data ) {
        if(data !== undefined && data.length > 0) {
            viewModel.usersComments(viewModel.usersComments().concat(data));
            viewModel.hasMoreComments(data.length === limit);
        } else {
            viewModel.hasMoreComments(false);
        }
        // ToDo: Error Loading Questions Answers
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
    
    viewModel.currentPageTitle(pages[viewModel.currentPageURL()][0]);
    
    switch(viewModel.currentPageURL()) {
        case 'dashboardallquizzes' : viewModel.allquizzes([]);
            getAllQuizzes();
            break;
        case 'dashboardquizresults' : viewModel.currentPageTitle(viewModel.currentPageTitle() + ' - ' + viewModel.selectedQuiz().name);
            getQuizUsers();
            break;
        case 'playersection' : viewModel.activeQuizzes([]);
            getActiveQuizzes();
            break;
        case 'playerplayquiz' : viewModel.currentPageTitle(viewModel.currentPageTitle() + ' - ' + viewModel.selectedQuiz().name);
            // ToDo: Update numbers with KO binding
            $('#correct').html(viewModel.quizUserData().correct);
            $('#wrong').html(viewModel.quizUserData().wrong);
            $('#remaining').html(viewModel.quizUserData().total - (viewModel.quizUserData().correct + viewModel.quizUserData().wrong));
            break;
        case 'quizmastersection' : viewModel.createdQuizzes([]);
            getCreatedQuizzes();
            break;
        case 'quizmastercreatequiz' : viewModel.quizQuestionsAnswers([]);
            getQuestionsAnswers();
            break;
        case 'comments' : viewModel.usersComments([]);
            getComments();
            break;
    }
}

function initAuthURLS() {
    for(var providerKey in authURLS) {
        $.get( "utils/authinfo.php?" + providerKey + "&authurls", function( data ) {
            if(data !== undefined) {
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

function facebookLoginRedirectURIBugFix() {
    if (window.location.hash === '#_=_') {
        window.location.hash = ''; // for older browsers, leaves a # behind
        history.pushState('', document.title, window.location.pathname); // nice and clean
        event.preventDefault(); // no page reload
    }
}



function initApp() {
    initSessionCookie();
    initAuthURLS();
    ko.applyBindings(viewModel);
    facebookLoginRedirectURIBugFix();
}