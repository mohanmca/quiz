/**
 * Quiz Management
 * Handles quiz execution, survey creation, and results
 */

// =============================================================================
// QUIZ MANAGER CLASS
// =============================================================================

class QuizManager {
    /**
     * Start a specific survey
     */
    static async startSurvey(surveyId) {
        Logger.group(`Starting Survey: ${surveyId}`);
        
        try {
            // Find the survey configuration
            const surveyConfig = platformState.availableSurveys.find(s => s.id === surveyId);
            if (!surveyConfig) {
                throw new Error(`${CONFIG.ERRORS.SURVEY_NOT_FOUND}: ${surveyId}`);
            }
            
            Logger.info(`Starting survey: ${surveyConfig.title}`);
            platformState.currentSurveyConfig = surveyConfig;
            
            // Verify SurveyJS is available
            if (typeof Survey === 'undefined' || !Survey.Model) {
                throw new Error('SurveyJS library not loaded. Please check that SurveyJS scripts are properly included.');
            }
            
            // Switch to quiz page first
            Utils.safeToggleDisplay(CONFIG.SELECTORS.HOME_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.CATEGORY_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_LIST_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_PAGE, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.BACK_BTN, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.STOP_QUIZ_BTN, true);
            
            // Show loading message
            Utils.safeSetContent(CONFIG.SELECTORS.SURVEY_CONTAINER, `
                <div class="text-center loading-state">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading ${surveyConfig.title}...</p>
                    <small class="text-muted">Preparing questions and initializing survey...</small>
                </div>
            `, true);
            
            // Record quiz start time
            platformState.quizStartTime = new Date();
            
            // Load questions and initialize survey
            await DataManager.loadQuestionsForSurvey(surveyConfig);
            await this.initializeSurvey();
            
            Logger.info('Survey started successfully');
            
        } catch (error) {
            Logger.error('Error starting survey', error);
            Utils.safeSetContent(CONFIG.SELECTORS.SURVEY_CONTAINER, `
                <div class="alert alert-danger">
                    <h4>Error Loading Quiz</h4>
                    <p>Failed to load the ${platformState.currentSurveyConfig?.title || 'selected'} quiz.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <details class="mt-2">
                        <summary>Technical Details</summary>
                        <pre class="mt-2">${error.stack || 'No stack trace available'}</pre>
                    </details>
                    <div class="mt-3">
                        <button class="btn btn-primary me-2" onclick="window.location.reload()">🔄 Reload Page</button>
                        <button class="btn btn-secondary" onclick="NavigationManager.showHomePage()">🏠 Back to Home</button>
                    </div>
                </div>
            `, true);
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Initialize SurveyJS survey
     */
    static async initializeSurvey() {
        Logger.group('Initializing Survey');
        
        try {
            if (!platformState.allQuestions || platformState.allQuestions.length === 0) {
                throw new Error('No questions available to create survey');
            }
            
            // Verify SurveyJS dependencies
            if (typeof Survey === 'undefined') {
                throw new Error('Survey library is not loaded');
            }
            
            if (!Survey.Model) {
                throw new Error('Survey.Model is not available');
            }
            
            // Clear the loading state first
            Utils.safeSetContent(CONFIG.SELECTORS.SURVEY_CONTAINER, '', true);
            
            // Create the base survey configuration
            const surveyConfig = this.createBaseSurveyConfig();
            Logger.debug('Base survey config created');
            
            // Add all questions to the config initially (will be filtered later)
            const shuffledQuestions = Utils.shuffleArray([...platformState.allQuestions]);
            const maxQuestions = platformState.allQuestions.length;
            const allQuestionPages = shuffledQuestions.slice(0, maxQuestions);
            
            // Add all questions to the survey config
            allQuestionPages.forEach((questionPage, index) => {
                try {
                    const question = questionPage.elements[0];
                    const originalTitle = question.title;
                    const quizTitle = platformState.currentSurveyConfig.title;
                    const quizIcon = platformState.currentSurveyConfig.icon;
                    
                    // Prepend quiz info to question title
                    question.title = `${quizIcon} ${quizTitle} - Question ${index + 1}\n\n${originalTitle}`;
                    
                    surveyConfig.pages.push({
                        name: `question${index + 1}`,
                        elements: questionPage.elements
                    });
                } catch (questionError) {
                    Logger.error(`Error processing question ${index}`, questionError);
                }
            });
            
            Logger.info(`Survey config now has ${surveyConfig.pages.length} pages`);
            
            // Create survey with error handling
            let survey;
            try {
                survey = new Survey.Model(surveyConfig);
                if (!survey) {
                    throw new Error('Survey.Model constructor returned null/undefined');
                }
                Logger.info('Survey created with pages:', survey.pages ? survey.pages.length : 'unknown');
            } catch (surveyCreateError) {
                Logger.error('Error creating Survey.Model', surveyCreateError);
                throw new Error(`Failed to create survey: ${surveyCreateError.message}`);
            }
            
            // Verify survey object has required methods
            if (!survey.onCurrentPageChanged || typeof survey.onCurrentPageChanged.add !== 'function') {
                Logger.error('Survey object missing event handler methods', {
                    hasOnCurrentPageChanged: !!survey.onCurrentPageChanged,
                    hasAddMethod: survey.onCurrentPageChanged ? typeof survey.onCurrentPageChanged.add : 'N/A'
                });
                throw new Error('Survey object is missing required event handler methods. This may indicate a SurveyJS version incompatibility.');
            }
            
            // Store survey instance
            platformState.currentSurvey = survey;
            
            // Set up survey event handlers
            this.setupSurveyEventHandlers(survey);
            
            // Clear container and render survey
            const surveyContainer = Utils.safeGetElement(CONFIG.SELECTORS.SURVEY_CONTAINER);
            surveyContainer.innerHTML = '';
            
            // Render survey using jQuery plugin with error handling
            try {
                // Verify jQuery plugin is available
                if (!$ || !$.fn.Survey) {
                    throw new Error('SurveyJS jQuery plugin not loaded');
                }
                
                $("#surveyContainer").Survey({
                    model: survey
                });
                
                // Verify the survey was rendered
                setTimeout(() => {
                    try {
                        const surveyElements = surveyContainer.querySelectorAll('.sv-root, .sd-root, .sv-container, .sd-container');
                        if (surveyElements.length === 0) {
                            Logger.error('Survey elements not found after rendering');
                            throw new Error('Survey failed to render properly - no survey DOM elements found');
                        } else {
                            Logger.info(`Survey rendered successfully with ${surveyElements.length} root elements`);
                        }
                    } catch (verifyError) {
                        Logger.error('Error verifying survey render', verifyError);
                    }
                }, 1500);
                
            } catch (renderError) {
                Logger.error('Error rendering survey with jQuery plugin', renderError);
                throw new Error(`Survey rendering failed: ${renderError.message}`);
            }
            
            Logger.info('Survey initialization completed');
            
        } catch (error) {
            Logger.error('Error initializing survey', error);
            
            // Show detailed error in the UI
            Utils.safeSetContent(CONFIG.SELECTORS.SURVEY_CONTAINER, `
                <div class="alert alert-danger">
                    <h4>Survey Initialization Failed</h4>
                    <p>There was an error setting up the quiz. This might be due to:</p>
                    <ul>
                        <li>SurveyJS library not loading properly</li>
                        <li>Invalid question format in the data file</li>
                        <li>JavaScript errors in survey configuration</li>
                        <li>Version incompatibility with SurveyJS</li>
                    </ul>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <details class="mt-2">
                        <summary>Technical Details</summary>
                        <pre class="mt-2">${error.stack || 'No stack trace available'}</pre>
                        <div class="mt-2">
                            <strong>Debug Info:</strong><br>
                            Survey available: ${typeof Survey !== 'undefined'}<br>
                            Survey.Model available: ${typeof Survey !== 'undefined' && Survey.Model ? 'true' : 'false'}<br>
                            jQuery available: ${typeof $ !== 'undefined'}<br>
                            jQuery.Survey available: ${typeof $ !== 'undefined' && $.fn && $.fn.Survey ? 'true' : 'false'}<br>
                            Questions loaded: ${platformState.allQuestions ? platformState.allQuestions.length : 0}
                        </div>
                    </details>
                    <div class="mt-3">
                        <button class="btn btn-primary me-2" onclick="window.location.reload()">🔄 Reload Page</button>
                        <button class="btn btn-secondary" onclick="NavigationManager.showHomePage()">🏠 Back to Home</button>
                        <button class="btn btn-info" onclick="console.log('SurveyJS Debug:', {Survey: typeof Survey, Model: typeof Survey !== 'undefined' ? typeof Survey.Model : 'N/A', jQuery: typeof $, jQuerySurvey: typeof $ !== 'undefined' && $.fn ? typeof $.fn.Survey : 'N/A'})">🐛 Debug SurveyJS</button>
                    </div>
                </div>
            `, true);
            
            throw error;
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Create base survey configuration
     */
    static createBaseSurveyConfig() {
        try {
            const timePerQuestion = platformState.currentSurveyConfig.timePerQuestion || CONFIG.DEFAULT_TIME_PER_QUESTION;
            const maxTimeToFinish = platformState.currentSurveyConfig.maxTimeToFinish || CONFIG.DEFAULT_MAX_TIME;
            
            return {
                title: platformState.currentSurveyConfig.title,
                description: platformState.currentSurveyConfig.description,
                showProgressBar: "bottom",
                showTimerPanel: "top",
                maxTimeToFinish: maxTimeToFinish,
                maxTimeToFinishPage: timePerQuestion,
                firstPageIsStarted: true,
                completedHtml: "<h4>You got <b>{correctAnswers}</b> out of <b>{questionCount}</b> correct answers.</h4>",
                completedHtmlOnCondition: [
                    { expression: "{correctAnswers} == 0", html: "<h4>Unfortunately, none of your answers are correct. Please review and try again!</h4>" },
                    { expression: "{correctAnswers} == {questionCount}", html: "<h4>Perfect score! You're ready for your interview!</h4>" }
                ],
                pages: [
                    {
                        name: "startPage",
                        elements: [
                            {
                                type: "html",
                                html: `<h4>Welcome to the ${platformState.currentSurveyConfig.title}!</h4><p>${platformState.currentSurveyConfig.description}</p><p>Choose how many questions you want to answer and enter your name below to begin.</p>`
                            },
                            {
                                type: "text",
                                name: "username",
                                title: "Your Name",
                                isRequired: false,
                                placeHolder: "Enter your name"
                            },
                            {
                                type: "dropdown",
                                name: "questionCount",
                                title: "Number of Questions",
                                isRequired: true,
                                choices: [
                                    { value: 5, text: "5 Questions (Quick)" },
                                    { value: 10, text: "10 Questions (Medium)" },
                                    { value: 15, text: "15 Questions (Extended)" },
                                    { value: Math.min(25, platformState.allQuestions.length), text: `${Math.min(25, platformState.allQuestions.length)} Questions (Full Quiz)` },
                                    { value: platformState.allQuestions.length, text: `${platformState.allQuestions.length} Questions (ALL-Maximum)` }
                                ],
                                defaultValue: 10
                            }
                        ]
                    }
                ]
            };
        } catch (error) {
            Logger.error('Error creating base survey config', error);
            throw error;
        }
    }
    
    /**
     * Setup survey event handlers
     */
    static setupSurveyEventHandlers(survey) {
        Logger.group('Setting up Survey Event Handlers');
        
        try {
            // Verify survey object and its methods
            if (!survey) {
                throw new Error('Survey object is null or undefined');
            }
            
            Logger.debug('Survey object type:', typeof survey);
            Logger.debug('Survey methods available:', {
                onCurrentPageChanged: typeof survey.onCurrentPageChanged,
                onComplete: typeof survey.onComplete,
                onError: typeof survey.onError
            });
            
            // Handle start page completion and question filtering
            if (survey.onCurrentPageChanged && typeof survey.onCurrentPageChanged.add === 'function') {
                survey.onCurrentPageChanged.add(function(sender, options) {
                    try {
                        if (options.oldCurrentPage && options.oldCurrentPage.name === "startPage") {
                            Logger.info("Leaving start page, filtering questions...");
                            
                            const questionCount = sender.getValue("questionCount") || 10;
                            const username = sender.getValue("username");
                            
                            Logger.info(`Filtering to ${questionCount} questions for user: ${username}`);
                            
                            // Remove excess question pages
                            const questionPages = sender.pages.filter(page => page.name.startsWith("question"));
                            const pagesToRemove = questionPages.slice(questionCount);
                            
                            Logger.debug(`Removing ${pagesToRemove.length} excess pages`);
                            pagesToRemove.forEach(page => sender.removePage(page));
                            
                            // Update timer based on question count
                            const timePerQuestion = platformState.currentSurveyConfig.timePerQuestion || CONFIG.DEFAULT_TIME_PER_QUESTION;
                            sender.maxTimeToFinish = questionCount * timePerQuestion;
                            sender.maxTimeToFinishPage = timePerQuestion;
                            
                            Logger.info(`Survey filtered to ${questionCount} questions, ${sender.maxTimeToFinish} seconds total`);
                        }
                    } catch (pageChangeError) {
                        Logger.error('Error in page change handler', pageChangeError);
                    }
                });
                Logger.debug('onCurrentPageChanged handler attached');
            } else {
                Logger.warn('onCurrentPageChanged not available or not a function', {
                    exists: !!survey.onCurrentPageChanged,
                    type: typeof survey.onCurrentPageChanged,
                    hasAdd: survey.onCurrentPageChanged ? typeof survey.onCurrentPageChanged.add : 'N/A'
                });
            }
            
            // Handle survey completion
            if (survey.onComplete && typeof survey.onComplete.add === 'function') {
                survey.onComplete.add(function(sender) {
                    try {
                        QuizManager.showDetailedResults(sender);
                    } catch (completionError) {
                        Logger.error('Error in completion handler', completionError);
                    }
                });
                Logger.debug('onComplete handler attached');
            } else {
                Logger.warn('onComplete not available or not a function');
            }
            
            // Add error handler for survey errors if available
            if (survey.onError && typeof survey.onError.add === 'function') {
                survey.onError.add(function(sender, options) {
                    Logger.error('Survey error occurred', options);
                });
                Logger.debug('onError handler attached');
            } else {
                Logger.debug('onError handler not available (this is normal for some SurveyJS versions)');
            }
            
            Logger.info('Survey event handlers setup complete');
        } catch (error) {
            Logger.error('Error setting up survey event handlers', error);
            throw new Error(`Failed to setup event handlers: ${error.message}. This may indicate a SurveyJS version compatibility issue.`);
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Show detailed results after quiz completion
     */
    static showDetailedResults(survey) {
        Logger.group('Showing Detailed Results');
        
        try {
            const data = survey.data;
            const pages = survey.pages.slice(1); // Exclude start page
            let correctCount = 0;
            let totalQuestions = pages.length;
            let failedQuestions = [];
            
            pages.forEach((page, index) => {
                const question = page.elements[0];
                const questionName = question.name;
                const userAnswer = data[questionName];
                const correctAnswer = question.correctAnswer;
                
                if (userAnswer === correctAnswer) {
                    correctCount++;
                } else {
                    failedQuestions.push({
                        number: index + 1,
                        title: question.title,
                        userAnswer: userAnswer || "No answer selected",
                        correctAnswer: correctAnswer,
                        choices: question.choices
                    });
                }
            });
            
            // Calculate time spent
            const timeSpent = platformState.quizStartTime ? Math.floor((new Date() - platformState.quizStartTime) / 1000) : 0;
            const timeSpentFormatted = Utils.formatTime(timeSpent);
            
            let resultsHtml = `
                <div class="results-container">
                    <div class="text-center mb-4">
                        <h2>${platformState.currentSurveyConfig.icon} ${platformState.currentSurveyConfig.title}</h2>
                        <h3>🎉 Quiz Completed for ${data.username || 'Anonymous'}</h3>
                        <p><strong>Total Time:</strong> ${timeSpentFormatted}</p>
                    </div>
                    <div class="score-summary">
                        <h4>Score: ${correctCount}/${totalQuestions} (${Math.round((correctCount/totalQuestions)*100)}%)</h4>
                    </div>
            `;
            
            if (failedQuestions.length > 0) {
                resultsHtml += `
                    <div class="failed-questions">
                        <h4>Questions You Missed:</h4>
                `;
                
                failedQuestions.forEach(q => {
                    resultsHtml += `
                        <div class="question-review">
                            <h5>Question ${q.number}: ${q.title}</h5>
                            <p><strong>Your Answer:</strong> <span class="wrong-answer">${q.userAnswer}</span></p>
                            <p><strong>Correct Answer:</strong> <span class="correct-answer">${q.correctAnswer}</span></p>
                            <hr>
                        </div>
                    `;
                });
                
                resultsHtml += `</div>`;
            } else {
                resultsHtml += `<p class="perfect-score">🎉 Perfect Score! You got all questions correct!</p>`;
            }
            
            resultsHtml += `
                    <div class="action-buttons">
                        <button onclick="QuizManager.startSurvey('${platformState.currentSurveyConfig.id}')" class="btn btn-primary me-2">Retake Quiz</button>
                        <button onclick="NavigationManager.showHomePage()" class="btn btn-secondary">Back to Home</button>
                    </div>
                </div>
            `;
            
            Utils.safeSetContent(CONFIG.SELECTORS.SURVEY_CONTAINER, resultsHtml, true);
            
            // Hide the stop quiz button since quiz is completed
            Utils.safeToggleDisplay(CONFIG.SELECTORS.STOP_QUIZ_BTN, false);
            
            Logger.info('Results displayed successfully');
        } catch (error) {
            Logger.error('Error showing detailed results', error);
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Stop quiz and show progress
     */
    static stopQuizAndShowProgress() {
        try {
            if (!platformState.currentSurvey) {
                alert('No active quiz found.');
                return;
            }
            
            // Show confirmation dialog
            const confirmed = confirm('Are you sure you want to stop the quiz? You will see your progress so far.');
            if (!confirmed) {
                return;
            }
            
            Logger.info('Quiz stopped by user');
            // For now, just show results - can be enhanced to show progress
            this.showDetailedResults(platformState.currentSurvey);
        } catch (error) {
            Logger.error('Error stopping quiz', error);
        }
    }
}

// Make QuizManager globally available
window.QuizPlatform.QuizManager = QuizManager;
window.QuizManager = QuizManager;
