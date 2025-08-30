/**
 * =============================================================================
 * Main Entry Point
 * =============================================================================
 * 
 * This file serves as the main entry point for the Quiz Platform application.
 * 
 * Responsibilities:
 * - Orchestrates the initial loading and setup of the platform on page load.
 * - Sets up a global event listener to handle all user clicks via event delegation.
 * - Calls the DataManager to load and process all necessary quiz data.
 * - Calls the UIManager to display the initial user interface.
 * - Implements a timeout mechanism to prevent the application from getting stuck
 *   during initialization.
 */

// Add a timeout mechanism for initialization
let initializationTimeout;
let initializationStarted = false;

/**
 * Handles all delegated click events for the application.
 * @param {Event} event - The click event.
 */
function handleGlobalClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const { action, categoryKey, subcategoryKey, surveyId } = target.dataset;
    Logger.debug(`Action triggered: ${action}`, { categoryKey, subcategoryKey, surveyId });

    try {
        switch (action) {
            case 'show-home-page':
                QuizPlatform.NavigationManager.showHomePage();
                break;
            case 'show-category':
                if (categoryKey) {
                    QuizPlatform.NavigationManager.showCategory(categoryKey);
                }
                break;
            case 'show-quiz-list':
                if (categoryKey && subcategoryKey) {
                    QuizPlatform.NavigationManager.showQuizList(categoryKey, subcategoryKey);
                }
                break;
            case 'start-survey':
                if (surveyId) {
                    QuizPlatform.QuizManager.startSurvey(surveyId);
                }
                break;
            default:
                Logger.warn(`Unknown action: ${action}`);
        }
    } catch (error) {
        Logger.error(`Error handling action '${action}'`, error);
        QuizPlatform.UIManager.showError('An unexpected error occurred. Please refresh the page and try again.');
    }
}

// Initialize the platform when the page loads
$(document).ready(async function() {
    try {
        // Set a timeout to catch stuck initialization
        initializationTimeout = setTimeout(() => {
            if (!initializationStarted) {
                console.error('Initialization timeout - external scripts may not have loaded');
                showInitializationError('Initialization timed out. Please check that all JavaScript files are available and refresh the page.');
            }
        }, 10000); // 10 second timeout

        // Check if required classes are available
        if (typeof Logger === 'undefined' || typeof DataManager === 'undefined') {
            throw new Error('Required JavaScript modules not loaded. Please ensure all script files are accessible.');
        }

        initializationStarted = true;
        Logger.info('Starting platform initialization...');

        // Setup global click handler
        document.body.addEventListener('click', handleGlobalClick);

        // Load and organize surveys
        await DataManager.loadAvailableSurveys();
        DataManager.organizeSurveysByCategory();

        // Display category cards
        if (typeof UIManager !== 'undefined') {
            UIManager.displayCategoryCards();
        } else {
            throw new Error('UIManager not loaded');
        }

        clearTimeout(initializationTimeout);
        Logger.info('Platform initialization completed successfully');

    } catch (error) {
        clearTimeout(initializationTimeout);
        console.error('Platform initialization failed:', error);

        showInitializationError(error.message);
    }
});

function showInitializationError(errorMessage) {
    const errorHtml = `
        <div class="alert alert-danger">
            <h4>Platform Initialization Failed</h4>
            <p>Failed to initialize the quiz platform. Please check the following:</p>
            <ul>
                <li>All JavaScript files are properly loaded</li>
                <li>surveys.json file is accessible</li>
                <li>You are running from a web server (not file:// protocol)</li>
            </ul>
            <p><strong>Error:</strong> ${errorMessage}</p>
            <div class="mt-3">
                <button class="btn btn-primary me-2" data-action="show-home-page">🔄 Retry</button>
                <button class="btn btn-secondary" onclick="console.log('Debug info:', {Logger: typeof Logger, DataManager: typeof DataManager, UIManager: typeof UIManager, NavigationManager: typeof NavigationManager, QuizManager: typeof QuizManager, Survey: typeof Survey, $: typeof $})">🐛 Debug Info</button>
                <button class="btn btn-info" onclick="debugUI()">🔍 Debug UI</button>
            </div>
        </div>
    `;

    try {
        document.getElementById('categoryGrid').innerHTML = errorHtml;
    } catch (uiError) {
        alert('Critical error: Platform failed to initialize. Please refresh the page.\n\nError: ' + errorMessage);
    }
}

// Add debugging function
function debugUI() {
    console.log('=== UI DEBUG INFO ===');
    console.log('Current page visibility:');
    console.log('- homePage:', document.getElementById('homePage').style.display);
    console.log('- categoryPage:', document.getElementById('categoryPage').style.display);
    console.log('- quizListPage:', document.getElementById('quizListPage').style.display);
    console.log('- quizPage:', document.getElementById('quizPage').style.display);

    const surveyContainer = document.getElementById('surveyContainer');
    console.log('Survey container:');
    console.log('- innerHTML length:', surveyContainer.innerHTML.length);
    console.log('- first 200 chars:', surveyContainer.innerHTML.substring(0, 200));
    console.log('- child nodes:', surveyContainer.children.length);

    console.log('SurveyJS elements:');
    console.log('- .sv-root:', document.querySelectorAll('.sv-root').length);
    console.log('- .sd-root:', document.querySelectorAll('.sd-root').length);

    console.log('Platform state:');
    console.log('- currentSurvey:', !!platformState.currentSurvey);
    console.log('- currentSurveyConfig:', !!platformState.currentSurveyConfig);
    console.log('- allQuestions length:', platformState.allQuestions?.length || 0);

    // Add visual debugging
    surveyContainer.classList.add('debug-container');
    setTimeout(() => surveyContainer.classList.remove('debug-container'), 3000);
}

// Make debugUI globally available
window.debugUI = debugUI;

console.log("main.js executed");