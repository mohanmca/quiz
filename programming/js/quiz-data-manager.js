/**
 * Quiz Platform Data Management
 * Handles loading and processing of survey and question data
 */

// =============================================================================
// DATA LOADING AND MANAGEMENT
// =============================================================================

class DataManager {
    /**
     * Load available surveys from JSON file
     */
    static async loadAvailableSurveys() {
        Logger.group('Loading Available Surveys');
        
        try {
            Logger.info('Starting survey load process');
            Logger.debug('Current location', window.location.href);
            Logger.debug('Attempting to fetch', CONFIG.SURVEYS_FILE);
            
            const surveys = await Utils.retryAsync(async () => {
                const response = await Utils.safeFetch(CONFIG.SURVEYS_FILE);
                
                const textContent = await response.text();
                Logger.debug('Raw response length', textContent.length);
                Logger.debug('First 200 chars', textContent.substring(0, 200));
                
                if (!textContent.trim()) {
                    throw new Error('Empty response received');
                }
                
                return Utils.safeJsonParse(textContent, []);
            });
            
            if (!Array.isArray(surveys)) {
                throw new Error('Invalid surveys data format - expected array');
            }
            
            // Validate survey data
            const validSurveys = surveys.filter(survey => {
                if (!Utils.validateSurveyData(survey)) {
                    Logger.warn('Invalid survey data, skipping', survey);
                    return false;
                }
                return true;
            });
            
            platformState.availableSurveys = validSurveys;
            Logger.info(`Successfully loaded ${validSurveys.length} valid surveys out of ${surveys.length} total`);
            Logger.debug('Loaded surveys', validSurveys);
            
            if (validSurveys.length === 0) {
                Logger.warn('No valid surveys found');
            }
            
            return validSurveys;
            
        } catch (error) {
            Logger.error('Error loading surveys', error);
            platformState.lastError = error;
            await this.handleSurveyLoadError(error);
            return [];
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Handle survey loading errors with user-friendly messages
     */
    static async handleSurveyLoadError(error) {
        Logger.debug('Handling survey load error', error);
        
        try {
            let errorHtml = '';
            
            if (error.message.includes('CORS') || error.name === 'TypeError' || error.message.includes('fetch')) {
                errorHtml = `
                    <div class="col-12">
                        <div class="alert alert-warning error-state">
                            <h4>🚫 Local File Access Issue</h4>
                            <p>The quiz platform needs to be served from a web server to work properly.</p>
                            <p><strong>Solution:</strong> Please open this in one of these ways:</p>
                            <ul>
                                <li>Run <code>python3 -m http.server 8000</code> in the programming folder, then visit <a href="http://localhost:8000" target="_blank">http://localhost:8000</a></li>
                                <li>Use any other local web server (Live Server extension in VS Code, etc.)</li>
                                <li>Use Node.js: <code>npx http-server</code></li>
                            </ul>
                            <p><strong>Error:</strong> ${error.message}</p>
                            <button class="btn btn-primary mt-3" onclick="window.location.reload()">🔄 Retry</button>
                        </div>
                    </div>
                `;
            } else if (error.message.includes('timeout')) {
                errorHtml = `
                    <div class="col-12">
                        <div class="alert alert-warning error-state">
                            <h4>⏱️ Request Timeout</h4>
                            <p>The request took too long to complete. Please check your internet connection.</p>
                            <p><strong>Error:</strong> ${error.message}</p>
                            <button class="btn btn-primary mt-3" onclick="DataManager.loadAvailableSurveys().then(() => window.location.reload())">🔄 Retry</button>
                        </div>
                    </div>
                `;
            } else {
                errorHtml = `
                    <div class="col-12">
                        <div class="alert alert-danger error-state">
                            <h4>❌ Error Loading Surveys</h4>
                            <p>Failed to load available surveys. Please check that the surveys.json file is available.</p>
                            <p><strong>Error:</strong> ${error.message}</p>
                            <p><strong>Current location:</strong> ${window.location.href}</p>
                            <p><strong>Trying to load:</strong> ${CONFIG.SURVEYS_FILE}</p>
                            <details class="mt-3">
                                <summary>Technical Details</summary>
                                <pre class="mt-2">${error.stack || 'No stack trace available'}</pre>
                            </details>
                            <div class="mt-3">
                                <button class="btn btn-primary me-2" onclick="window.location.reload()">🔄 Retry</button>
                                <button class="btn btn-secondary" onclick="Logger.getLogs().forEach(log => console.log(log))">📋 Show Logs</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            Utils.safeSetContent(CONFIG.SELECTORS.QUIZ_GRID, errorHtml, true);
        } catch (uiError) {
            Logger.error('Error updating UI with error message', uiError);
            // Fallback to alert if UI update fails
            alert(`Failed to load surveys: ${error.message}`);
        }
    }
    
    /**
     * Load questions for a specific survey
     */
    static async loadQuestionsForSurvey(surveyConfig) {
        Logger.group('Loading Questions for Survey');
        
        try {
            if (!Utils.validateSurveyData(surveyConfig)) {
                throw new Error(`${CONFIG.ERRORS.INVALID_SURVEY_CONFIG}: ${surveyConfig?.id || 'unknown'}`);
            }
            
            Logger.info(`Loading questions for ${surveyConfig.title}`);
            Logger.debug('Survey config', surveyConfig);
            
            const questions = await Utils.retryAsync(async () => {
                const response = await Utils.safeFetch(`./${surveyConfig.questionsFile}`);
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error('Invalid questions data format - expected array');
                }
                
                return data;
            });
            
            Logger.info(`Loaded ${questions.length} raw questions`);
            
            if (questions.length === 0) {
                throw new Error('No questions found in the questions file');
            }
            
            // Validate questions
            const validQuestions = questions.filter((question, index) => {
                try {
                    // For standard questions, ensure basic structure
                    if (!question.title && !question.question) {
                        Logger.warn(`Question ${index} missing title/question`, question);
                        return false;
                    }
                    
                    if (!question.choices && !question.options) {
                        Logger.warn(`Question ${index} missing choices/options`, question);
                        return false;
                    }
                    
                    if (!question.correctAnswer) {
                        Logger.warn(`Question ${index} missing correct answer`, question);
                        return false;
                    }
                    
                    return true;
                } catch (error) {
                    Logger.error(`Error validating question ${index}`, error);
                    return false;
                }
            });
            
            Logger.info(`${validQuestions.length} valid questions after validation`);
            
            if (validQuestions.length === 0) {
                throw new Error('No valid questions found after validation');
            }
            
            // Process questions based on survey type
            let processedQuestions = validQuestions;
            try {
                if (surveyConfig.id === 'leetcode-medium-python' || 
                    validQuestions.some(q => q.questionType === 'source-code')) {
                    Logger.info('Processing questions for source-code survey');
                    processedQuestions = this.processSourceCodeQuestions(validQuestions);
                } else {
                    Logger.info('Converting standard quiz questions to SurveyJS format');
                    processedQuestions = this.processStandardQuestions(validQuestions);
                }
            } catch (processingError) {
                Logger.error('Error processing questions, using original format', processingError);
                processedQuestions = validQuestions;
            }
            
            // Convert questions to page format
            platformState.allQuestions = processedQuestions.map((question, index) => {
                try {
                    return { elements: [question] };
                } catch (error) {
                    Logger.error(`Error creating page for question ${index}`, error);
                    return null;
                }
            }).filter(page => page !== null);
            
            platformState.questionsLoaded = true;
            Logger.info(`Successfully processed ${platformState.allQuestions.length} questions`);
            
            return platformState.allQuestions;
            
        } catch (error) {
            Logger.error('Error loading questions', error);
            platformState.lastError = error;
            throw new Error(`${CONFIG.ERRORS.QUESTIONS_LOAD_FAILED}: ${error.message}`);
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Process source code questions
     */
    static processSourceCodeQuestions(questions) {
        Logger.debug('Processing source code questions');
        
        return questions.map((question, index) => {
            try {
                // Keep original choices for SurveyJS, process after rendering
                if (question.title) {
                    question.title = question.title.replace(/\\n/g, '\n');
                }
                
                // Process choices to unescape newlines but keep as text for SurveyJS
                if (question.choices && Array.isArray(question.choices)) {
                    question.choices = question.choices.map(choice => {
                        if (typeof choice === 'string') {
                            return choice.replace(/\\n/g, '\n').replace(/\\t/g, '    ');
                        }
                        return choice;
                    });
                }
                
                // Process correct answer
                if (question.correctAnswer) {
                    question.correctAnswer = question.correctAnswer.replace(/\\n/g, '\n').replace(/\\t/g, '    ');
                }
                
                Logger.debug(`Processed source code question ${index}: ${question.name || question.title?.substring(0, 50)}`);
                return question;
            } catch (error) {
                Logger.error(`Error processing source code question ${index}`, { question, error });
                return question; // Return original if processing fails
            }
        });
    }
    
    /**
     * Process standard questions
     */
    static processStandardQuestions(questions) {
        Logger.debug('Processing standard questions');
        
        return questions.map((q, index) => {
            try {
                const processed = {
                    type: "radiogroup",
                    name: `question${q.id || index + 1}`,
                    title: q.question || q.title,
                    choices: q.options || q.choices,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                };
                
                Logger.debug(`Processed standard question ${index}: ${processed.name}`);
                return processed;
            } catch (error) {
                Logger.error(`Error processing standard question ${index}`, { question: q, error });
                return null;
            }
        }).filter(q => q !== null);
    }
    
    /**
     * Organize surveys by category and subcategory
     */
    static organizeSurveysByCategory() {
        Logger.group('Organizing Surveys by Category');
        
        try {
            const surveyMapping = {
                "leetcode-medium-python": { category: "algorithms", subcategory: "leetcode" },
                "python-internals": { category: "programming", subcategory: "python" },
                "python-data-structures": { category: "algorithms", subcategory: "data-structures" },
                "python-dunder-methods": { category: "programming", subcategory: "python" },
                "python-type-internals": { category: "programming", subcategory: "python" },
                "jvm-internals": { category: "programming", subcategory: "jvm" },
                "golang-internals": { category: "programming", subcategory: "golang" },
                "scala-slick-api": { category: "programming", subcategory: "scala" },
                "advanced-data-structures-python": { category: "algorithms", subcategory: "advanced" },
                "aws-k8s-secrets": { category: "cloud", subcategory: "aws" },                
                "airflow-programming": { category: "data", subcategory: "workflow" },
                "aws-policy-permissions": { category: "cloud", subcategory: "aws" },
                "terraform-terragrunt": { category: "cloud", subcategory: "terraform" },
                "crypto-derivatives": { category: "finance", subcategory: "crypto" },
                "oms-fix-questions": { category: "finance", subcategory: "trading" }                
            };
            
            platformState.categories = {};
            
            if (!platformState.availableSurveys || !Array.isArray(platformState.availableSurveys)) {
                Logger.warn('No available surveys to organize');
                return;
            }
            
            platformState.availableSurveys.forEach((survey, index) => {
                try {
                    const mapping = surveyMapping[survey.id];
                    if (!mapping) {
                        Logger.warn(`No mapping found for survey: ${survey.id}`);
                        return;
                    }
                    
                    const { category, subcategory } = mapping;
                    
                    if (!platformState.categories[category]) {
                        if (!categoryStructure[category]) {
                            Logger.warn(`Category structure not found: ${category}`);
                            return;
                        }
                        
                        platformState.categories[category] = {
                            ...categoryStructure[category],
                            subcategories: {}
                        };
                    }
                    
                    if (!platformState.categories[category].subcategories[subcategory]) {
                        if (!categoryStructure[category].subcategories[subcategory]) {
                            Logger.warn(`Subcategory structure not found: ${category}.${subcategory}`);
                            return;
                        }
                        
                        platformState.categories[category].subcategories[subcategory] = {
                            ...categoryStructure[category].subcategories[subcategory],
                            quizzes: []
                        };
                    }
                    
                    platformState.categories[category].subcategories[subcategory].quizzes.push(survey);
                    Logger.debug(`Added survey ${survey.id} to ${category}.${subcategory}`);
                    
                } catch (error) {
                    Logger.error(`Error organizing survey ${index}: ${survey.id}`, error);
                }
            });
            
            const totalCategories = Object.keys(platformState.categories).length;
            const totalSubcategories = Object.values(platformState.categories).reduce((total, cat) => 
                total + Object.keys(cat.subcategories).length, 0);
            const totalQuizzes = Object.values(platformState.categories).reduce((total, cat) => 
                total + Object.values(cat.subcategories).reduce((subTotal, sub) => 
                    subTotal + sub.quizzes.length, 0), 0);
            
            Logger.info(`Successfully organized: ${totalCategories} categories, ${totalSubcategories} subcategories, ${totalQuizzes} quizzes`);
            Logger.debug('Organized categories', platformState.categories);
            
        } catch (error) {
            Logger.error('Error organizing surveys by category', error);
            platformState.lastError = error;
        } finally {
            Logger.groupEnd();
        }
    }
}

// Make DataManager globally available
window.QuizPlatform.DataManager = DataManager;
