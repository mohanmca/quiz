# JavaScript Documentation & Coding Standards

This document provides an overview of the JavaScript components, coding standards, and lessons learned for the Quiz Platform application.

## 1. Lessons Learned

### Robust Global Object Initialization

A critical lesson from a recent bug (`TypeError: Cannot read properties of undefined...`) is the importance of robustly initializing the global `QuizPlatform` namespace.

- **Problem**: Scripts were loaded in an order that assumed `window.QuizPlatform` existed, but its creation was dependent on one of those scripts (`quiz-platform.js`) executing fully. This created a race condition.
- **Solution**: `quiz-platform.js` now immediately initializes `window.QuizPlatform = {};` at the very top. Subsequent scripts can then safely attach their components (e.g., `QuizPlatform.DataManager`, `QuizPlatform.UIManager`) to this object without risk of it being undefined.
- **Rule**: The global namespace object must be created before any components attempt to extend it.

## 2. Coding Standards

### Global Namespace

- All shared functionality (classes, state, etc.) must be attached to the single global object `window.QuizPlatform`. This minimizes global scope pollution and provides a clear structure.
- The base `QuizPlatform` object is initialized in `quiz-platform.js`.

### File Structure & Component Responsibilities

Each JavaScript file has a distinct responsibility. Do not mix concerns between files.

- **`quiz-platform.js`**: The core of the application. Initializes the global namespace and provides shared utilities like `Logger`, `Utils`, `CONFIG`, and the global `platformState`.
- **`quiz-data-manager.js`**: Handles all data-related operations. Its sole responsibility is to fetch, process, and structure the quiz and survey data. It should not perform any direct DOM manipulation.
- **`quiz-ui-manager.js`**: Handles all UI rendering and DOM manipulation. This includes displaying category cards, switching between pages, and showing error messages. It should not contain any quiz logic or data-fetching code.
- **`quiz-manager.js`**: Contains the logic for managing a quiz session. This includes starting a survey, initializing the SurveyJS library, handling quiz completion, and showing results.
- **`main.js`**: The application's entry point. It orchestrates the initial setup by calling the necessary methods from the other components (e.g., `DataManager.loadAvailableSurveys`, `UIManager.displayCategoryCards`).

### Naming Conventions

- **Classes**: Use `PascalCase` (e.g., `QuizManager`, `DataManager`).
- **Methods**: Use `camelCase` (e.g., `startSurvey`, `loadQuestionsForSurvey`).
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `CONFIG`, `SELECTORS`).

### Error Handling

- Use the `Logger` utility for all console output (`Logger.info`, `Logger.error`, etc.). This provides consistent formatting and allows for debugging flags.
- Use `try...catch` blocks for operations that can fail, especially I/O (fetch) and DOM manipulation.
- Provide user-friendly error messages using `UIManager.showError` or by rendering specific error states in the UI.

## 3. Component Documentation

### `main.js`

- **Responsibility**: Application entry point.
- **Execution**: Runs on `$(document).ready()`.
- **Key Actions**:
    1.  Initializes the platform.
    2.  Calls `DataManager.loadAvailableSurveys()` to fetch the list of quizzes.
    3.  Calls `DataManager.organizeSurveysByCategory()` to structure the data.
    4.  Calls `UIManager.displayCategoryCards()` to render the initial home page view.
    5.  Includes a timeout to handle cases where initialization gets stuck.

### `quiz-platform.js`

- **Responsibility**: Core application setup, global state, and shared utilities.
- **Key Components**:
    - `window.QuizPlatform`: The global namespace object.
    - `CONFIG`: A constant object for storing configuration values (API endpoints, selectors, etc.).
    - `platformState`: A global, reactive state object that holds the application's current state (e.g., `currentSurvey`, `availableSurveys`).
    - `Logger`: A class for standardized console logging with different levels (info, error, debug).
    - `Utils`: A collection of static utility functions for common tasks (e.g., `safeFetch`, `shuffleArray`, DOM manipulation helpers).
    - `categoryStructure`: Defines the hierarchy and metadata for quiz categories and subcategories.

### `quiz-data-manager.js`

- **Responsibility**: All data loading and processing.
- **Key Methods**:
    - `loadAvailableSurveys()`: Fetches `surveys.json` to get the list of all available quizzes.
    - `loadQuestionsForSurvey(surveyConfig)`: Fetches the specific JSON file for a selected quiz.
    - `organizeSurveysByCategory()`: Processes the flat list of surveys and organizes them into a nested structure based on `categoryStructure`.
    - `processSourceCodeQuestions()` / `processStandardQuestions()`: Transforms raw question data into the format required by the SurveyJS library.

### `quiz-ui-manager.js`

- **Responsibility**: All DOM manipulation and UI rendering.
- **Key Components**:
    - `UIManager`: A class that handles the rendering of different views.
        - `displayCategoryCards()`: Renders the main category cards on the home page.
        - `displaySubcategoryCards()`: Renders the subcategory cards for a selected category.
        - `displayQuizzesForSubcategory()`: Renders the list of quizzes for a selected subcategory.
        - `showError()`: Displays a user-friendly error message in the UI.
    - `NavigationManager`: A class that controls page visibility.
        - `showHomePage()`: Shows the home page and hides others.
        - `showCategory()`: Shows the category page.
        - `showQuizList()`: Shows the quiz list page.

### `quiz-manager.js`

- **Responsibility**: Manages the lifecycle of a single quiz.
- **Key Methods**:
    - `startSurvey(surveyId)`: The main function to begin a quiz. It finds the survey config, loads the questions, and initializes the survey UI.
    - `initializeSurvey()`: Sets up the SurveyJS `Survey.Model` with the appropriate configuration and questions.
    - `setupSurveyEventHandlers(survey)`: Attaches event listeners to the survey object (e.g., `onComplete`, `onCurrentPageChanged`).
    - `showDetailedResults(survey)`: Renders the final results page after a quiz is completed.
    - `stopQuizAndShowProgress()`: Allows a user to exit a quiz prematurely.
