/**
 * Quiz Platform UI Management
 * Handles all user interface interactions and rendering
 */

// =============================================================================
// UI MANAGEMENT CLASS
// =============================================================================

class UIManager {
    /**
     * Display category cards on home page
     */
    static displayCategoryCards() {
        Logger.group('Displaying Category Cards');
        
        try {
            const grid = Utils.safeGetElement(CONFIG.SELECTORS.CATEGORY_GRID);
            
            if (!platformState.categories || Object.keys(platformState.categories).length === 0) {
                Logger.warn('No categories available to display');
                grid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <h4>📦 No Categories Available</h4>
                            <p class="text-muted">No quiz categories are currently available. Please check back later.</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">🔄 Refresh</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            const categoryCards = Object.entries(platformState.categories).map(([categoryKey, category]) => {
                try {
                    const subcategoryCount = Object.keys(category.subcategories || {}).length;
                    const totalQuizzes = Object.values(category.subcategories || {}).reduce((total, sub) => total + (sub.quizzes?.length || 0), 0);
                    
                    return `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card category-card h-100 position-relative" 
                                 onclick="NavigationManager.showCategory('${categoryKey}')" 
                                 style="border-color: ${category.color}30;"
                                 tabindex="0"
                                 role="button"
                                 aria-label="Open ${category.title} category">
                                <div class="card-body text-center">
                                    <div class="category-icon" style="color: ${category.color};" aria-hidden="true">
                                        ${category.icon}
                                    </div>
                                    <h5 class="card-title" style="color: ${category.color};">
                                        ${category.title}
                                    </h5>
                                    <p class="card-text text-muted">
                                        ${category.description}
                                    </p>
                                    <div class="mt-3">
                                        <div class="row text-center">
                                            <div class="col-6">
                                                <div class="d-block">
                                                    <strong style="color: ${category.color};">${subcategoryCount}</strong>
                                                    <small class="d-block text-muted">Categories</small>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="d-block">
                                                    <strong style="color: ${category.color};">${totalQuizzes}</strong>
                                                    <small class="d-block text-muted">Quizzes</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    Logger.error(`Error creating category card for ${categoryKey}`, error);
                    return ''; // Return empty string if card creation fails
                }
            }).filter(card => card !== ''); // Remove empty cards
            
            grid.innerHTML = categoryCards.join('');
            Logger.info(`Displayed ${categoryCards.length} category cards`);
            
        } catch (error) {
            Logger.error('Error displaying category cards', error);
            this.showError('Failed to display categories. Please refresh the page.');
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Display subcategory cards
     */
    static displaySubcategoryCards(categoryKey) {
        Logger.group(`Displaying Subcategory Cards for ${categoryKey}`);
        
        try {
            const grid = Utils.safeGetElement(CONFIG.SELECTORS.SUBCATEGORY_GRID);
            const category = platformState.categories[categoryKey];
            
            if (!category) {
                Logger.error(`Category not found: ${categoryKey}`);
                throw new Error(CONFIG.ERRORS.CATEGORY_NOT_FOUND);
            }
            
            if (!category.subcategories || Object.keys(category.subcategories).length === 0) {
                Logger.warn(`No subcategories available for ${categoryKey}`);
                grid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <h4>📂 No Subcategories</h4>
                            <p class="text-muted">No subcategories are available in this category.</p>
                            <button class="btn btn-secondary" onclick="NavigationManager.showHomePage()">← Back to Categories</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            const subcategoryCards = Object.entries(category.subcategories).map(([subcategoryKey, subcategory]) => {
                try {
                    const quizCount = subcategory.quizzes?.length || 0;
                    
                    return `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card quiz-card h-100 position-relative" 
                                 onclick="NavigationManager.showQuizList('${categoryKey}', '${subcategoryKey}')" 
                                 style="border-color: ${subcategory.color}20;"
                                 tabindex="0"
                                 role="button"
                                 aria-label="Open ${subcategory.title} quizzes">
                                <div class="card-body text-center">
                                    <div class="quiz-icon" style="color: ${subcategory.color};" aria-hidden="true">
                                        ${subcategory.icon}
                                    </div>
                                    <h5 class="card-title" style="color: ${subcategory.color};">
                                        ${subcategory.title}
                                    </h5>
                                    <p class="card-text text-muted">
                                        ${subcategory.description}
                                    </p>
                                    <div class="mt-3">
                                        <div class="text-center">
                                            <strong style="color: ${subcategory.color};">${quizCount}</strong>
                                            <small class="d-block text-muted">${quizCount === 1 ? 'Quiz' : 'Quizzes'} Available</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    Logger.error(`Error creating subcategory card for ${subcategoryKey}`, error);
                    return '';
                }
            }).filter(card => card !== '');
            
            grid.innerHTML = subcategoryCards.join('');
            Logger.info(`Displayed ${subcategoryCards.length} subcategory cards`);
            
        } catch (error) {
            Logger.error('Error displaying subcategory cards', error);
            this.showError('Failed to display subcategories. Please try again.');
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Display quiz cards for a specific subcategory
     */
    static displayQuizzesForSubcategory(categoryKey, subcategoryKey) {
        Logger.group(`Displaying Quizzes for ${categoryKey}.${subcategoryKey}`);
        
        try {
            const grid = Utils.safeGetElement(CONFIG.SELECTORS.QUIZ_GRID);
            const subcategory = platformState.categories[categoryKey]?.subcategories[subcategoryKey];
            
            if (!subcategory) {
                Logger.error(`Subcategory not found: ${categoryKey}.${subcategoryKey}`);
                throw new Error(CONFIG.ERRORS.SUBCATEGORY_NOT_FOUND);
            }
            
            if (!subcategory.quizzes || subcategory.quizzes.length === 0) {
                Logger.warn(`No quizzes available for ${categoryKey}.${subcategoryKey}`);
                grid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <h4>📝 No Quizzes</h4>
                            <p class="text-muted">No quizzes are available in this subcategory.</p>
                            <button class="btn btn-secondary" onclick="NavigationManager.showCategory('${categoryKey}')">← Back to Category</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            const quizCards = subcategory.quizzes.map(survey => {
                try {
                    if (!Utils.validateSurveyData(survey)) {
                        Logger.warn('Invalid survey data, skipping', survey);
                        return '';
                    }
                    
                    const timePerQuestion = survey.timePerQuestion || CONFIG.DEFAULT_TIME_PER_QUESTION;
                    const formattedTime = Utils.formatTime(timePerQuestion);
                    
                    return `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card quiz-card h-100 position-relative" 
                                 onclick="QuizManager.startSurvey('${survey.id}')" 
                                 style="border-color: ${survey.color}20;"
                                 tabindex="0"
                                 role="button"
                                 aria-label="Start ${survey.title} quiz">
                                <span class="difficulty-badge badge bg-secondary">${survey.difficulty || 'Medium'}</span>
                                <div class="card-body text-center">
                                    <div class="quiz-icon" style="color: ${survey.color};" aria-hidden="true">
                                        ${survey.icon}
                                    </div>
                                    <h5 class="card-title" style="color: ${survey.color};">
                                        ${survey.title}
                                    </h5>
                                    <p class="card-text text-muted">
                                        ${survey.description}
                                    </p>
                                    <div class="mt-3">
                                        <small class="text-muted">
                                            <i class="bi bi-clock" aria-hidden="true"></i> ${survey.estimatedTime || '15-20 minutes'}<br>
                                            <i class="bi bi-folder" aria-hidden="true"></i> ${survey.category || 'General'}<br>
                                            <i class="fas fa-stopwatch" aria-hidden="true"></i> ${formattedTime} per question
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    Logger.error(`Error creating quiz card for ${survey.id}`, error);
                    return '';
                }
            }).filter(card => card !== '');
            
            grid.innerHTML = quizCards.join('');
            Logger.info(`Displayed ${quizCards.length} quiz cards`);
            
        } catch (error) {
            Logger.error('Error displaying quiz cards', error);
            this.showError('Failed to display quizzes. Please try again.');
        } finally {
            Logger.groupEnd();
        }
    }
    
    /**
     * Show error message
     */
    static showError(message, container = CONFIG.SELECTORS.CATEGORY_GRID) {
        try {
            const errorHtml = `
                <div class="col-12">
                    <div class="alert alert-danger error-state">
                        <h4>❌ Error</h4>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="NavigationManager.showHomePage()">🏠 Back to Home</button>
                        <button class="btn btn-secondary ms-2" onclick="window.location.reload()">🔄 Refresh</button>
                    </div>
                </div>
            `;
            Utils.safeSetContent(container, errorHtml, true);
            Logger.debug(`Showing error: ${message}`);
        } catch (error) {
            Logger.error('Error showing error message', error);
        }
    }
}

// =============================================================================
// NAVIGATION MANAGER CLASS
// =============================================================================

class NavigationManager {
    /**
     * Show home page
     */
    static showHomePage() {
        Logger.debug('Navigating to home page');
        
        try {
            // Reset navigation state
            platformState.currentCategory = null;
            platformState.currentSubcategory = null;
            
            // Show home page and hide others
            Utils.safeToggleDisplay(CONFIG.SELECTORS.HOME_PAGE, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.CATEGORY_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_LIST_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.BACK_BTN, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.STOP_QUIZ_BTN, false);
            
            // Display categories
            UIManager.displayCategoryCards();
            
            Logger.info('Successfully navigated to home page');
        } catch (error) {
            Logger.error('Error navigating to home page', error);
        }
    }
    
    /**
     * Show category page
     */
    static showCategory(categoryKey) {
        Logger.debug(`Navigating to category: ${categoryKey}`);
        
        try {
            if (!categoryKey || !platformState.categories[categoryKey]) {
                throw new Error(`${CONFIG.ERRORS.CATEGORY_NOT_FOUND}: ${categoryKey}`);
            }
            
            platformState.currentCategory = categoryKey;
            const category = platformState.categories[categoryKey];
            
            // Update page content
            Utils.safeSetContent('#categoryTitle', category.title);
            Utils.safeSetContent('#categoryDescription', category.description);
            Utils.safeSetContent('#categoryBreadcrumb', category.title);
            
            // Display subcategories
            UIManager.displaySubcategoryCards(categoryKey);
            
            // Show category page
            Utils.safeToggleDisplay(CONFIG.SELECTORS.HOME_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.CATEGORY_PAGE, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_LIST_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.BACK_BTN, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.STOP_QUIZ_BTN, false);
            
            Logger.info(`Successfully navigated to category: ${categoryKey}`);
        } catch (error) {
            Logger.error(`Error navigating to category: ${categoryKey}`, error);
            UIManager.showError(`Failed to load category: ${categoryKey}`);
        }
    }
    
    /**
     * Show quiz list page
     */
    static showQuizList(categoryKey, subcategoryKey) {
        Logger.debug(`Navigating to quiz list: ${categoryKey}.${subcategoryKey}`);
        
        try {
            if (!categoryKey || !subcategoryKey || !platformState.categories[categoryKey]?.subcategories[subcategoryKey]) {
                throw new Error(`${CONFIG.ERRORS.SUBCATEGORY_NOT_FOUND}: ${categoryKey}.${subcategoryKey}`);
            }
            
            platformState.currentCategory = categoryKey;
            platformState.currentSubcategory = subcategoryKey;
            
            const category = platformState.categories[categoryKey];
            const subcategory = platformState.categories[categoryKey].subcategories[subcategoryKey];
            
            // Update page content
            Utils.safeSetContent('#quizListTitle', subcategory.title);
            Utils.safeSetContent('#quizListDescription', subcategory.description);
            Utils.safeSetContent('#categoryBreadcrumbLink', category.title);
            Utils.safeSetContent('#subcategoryBreadcrumb', subcategory.title);
            
            // Display quizzes
            UIManager.displayQuizzesForSubcategory(categoryKey, subcategoryKey);
            
            // Show quiz list page
            Utils.safeToggleDisplay(CONFIG.SELECTORS.HOME_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.CATEGORY_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_LIST_PAGE, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.QUIZ_PAGE, false);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.BACK_BTN, true);
            Utils.safeToggleDisplay(CONFIG.SELECTORS.STOP_QUIZ_BTN, false);
            
            Logger.info(`Successfully navigated to quiz list: ${categoryKey}.${subcategoryKey}`);
        } catch (error) {
            Logger.error(`Error navigating to quiz list: ${categoryKey}.${subcategoryKey}`, error);
            UIManager.showError(`Failed to load quiz list: ${categoryKey}.${subcategoryKey}`);
        }
    }
}

// Make classes globally available
window.QuizPlatform.UIManager = UIManager;
window.QuizPlatform.NavigationManager = NavigationManager;

// Global aliases for backward compatibility
window.NavigationManager = NavigationManager;
window.UIManager = UIManager;
