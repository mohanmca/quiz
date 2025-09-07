/**
 * Quiz Platform JavaScript
 * Comprehensive quiz platform with robust error handling and debugging
 */

// =============================================================================
// CONSTANTS AND CONFIGURATION
// =============================================================================

const CONFIG = {
    DEBUG: true,
    VERSION: '1.0.0',
    DEFAULT_TIME_PER_QUESTION: 60,
    DEFAULT_MAX_TIME: 1800,
    DEFAULT_COUNTDOWN_SECONDS: 10,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    SURVEYS_FILE: './data/json/surveys.json',
    
    // Error messages
    ERRORS: {
        SURVEY_NOT_FOUND: 'Survey configuration not found',
        QUESTIONS_LOAD_FAILED: 'Failed to load questions',
        NETWORK_ERROR: 'Network error occurred',
        INVALID_DATA: 'Invalid data received',
        SURVEY_INIT_FAILED: 'Failed to initialize survey',
        CATEGORY_NOT_FOUND: 'Category not found',
        SUBCATEGORY_NOT_FOUND: 'Subcategory not found',
        ELEMENT_NOT_FOUND: 'Required DOM element not found',
        INVALID_SURVEY_CONFIG: 'Invalid survey configuration'
    },
    
    // Element selectors
    SELECTORS: {
        HOME_PAGE: '#homePage',
        CATEGORY_PAGE: '#categoryPage',
        QUIZ_LIST_PAGE: '#quizListPage',
        QUIZ_PAGE: '#quizPage',
        SURVEY_CONTAINER: '#surveyContainer',
        CATEGORY_GRID: '#categoryGrid',
        SUBCATEGORY_GRID: '#subcategoryGrid',
        QUIZ_GRID: '#quizGrid',
        BACK_BTN: '#backBtn',
        STOP_QUIZ_BTN: '#stopQuizBtn'
    }
};

// =============================================================================
// GLOBAL STATE MANAGEMENT
// =============================================================================

class QuizPlatformState {
    constructor() {
        this.reset();
        this.initializeEventListeners();
    }
    
    reset() {
        try {
            this.availableSurveys = [];
            this.currentSurvey = null;
            this.currentSurveyConfig = null;
            this.allQuestions = [];
            this.questionsLoaded = false;
            this.quizStartTime = null;
            this.currentCategory = null;
            this.currentSubcategory = null;
            this.categories = {};
            this.debugMode = CONFIG.DEBUG;
            this.retryCount = 0;
            this.lastError = null;
            
            Logger.debug('Platform state reset successfully');
        } catch (error) {
            Logger.error('Error resetting platform state', error);
            throw error;
        }
    }
    
    isValid() {
        try {
            const isValid = this.availableSurveys && Array.isArray(this.availableSurveys);
            Logger.debug(`Platform state validation: ${isValid ? 'valid' : 'invalid'}`);
            return isValid;
        } catch (error) {
            Logger.error('Error validating platform state', error);
            return false;
        }
    }
    
    initializeEventListeners() {
        try {
            // Error event listeners for global error handling
            window.addEventListener('error', (event) => {
                Logger.error('Global JavaScript error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                });
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                Logger.error('Unhandled promise rejection', event.reason);
                event.preventDefault();
            });
            
            Logger.debug('Global event listeners initialized');
        } catch (error) {
            Logger.error('Error initializing event listeners', error);
        }
    }
}

// =============================================================================
// DEBUGGING AND LOGGING UTILITIES
// =============================================================================

class Logger {
    static log(level, message, data = null) {
        if (!CONFIG.DEBUG && level === 'debug') return;
        
        try {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            switch (level) {
                case 'error':
                    console.error(logMessage, data || '');
                    this.logToStorage('error', message, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data || '');
                    this.logToStorage('warn', message, data);
                    break;
                case 'info':
                    console.info(logMessage, data || '');
                    this.logToStorage('info', message, data);
                    break;
                case 'debug':
                    console.log(logMessage, data || '');
                    break;
                default:
                    console.log(logMessage, data || '');
            }
        } catch (error) {
            console.error('Logging error:', error);
        }
    }
    
    static logToStorage(level, message, data) {
        try {
            if (!window.localStorage) return;
            
            const logs = JSON.parse(localStorage.getItem('quiz-platform-logs') || '[]');
            logs.push({
                timestamp: new Date().toISOString(),
                level,
                message,
                data: data ? JSON.stringify(data) : null
            });
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('quiz-platform-logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Error saving log to storage:', error);
        }
    }
    
    static error(message, data = null) {
        this.log('error', message, data);
    }
    
    static warn(message, data = null) {
        this.log('warn', message, data);
    }
    
    static info(message, data = null) {
        this.log('info', message, data);
    }
    
    static debug(message, data = null) {
        this.log('debug', message, data);
    }
    
    static group(label) {
        if (CONFIG.DEBUG) {
            console.group(label);
        }
    }
    
    static groupEnd() {
        if (CONFIG.DEBUG) {
            console.groupEnd();
        }
    }
    
    static getLogs() {
        try {
            return JSON.parse(localStorage.getItem('quiz-platform-logs') || '[]');
        } catch (error) {
            console.error('Error retrieving logs:', error);
            return [];
        }
    }
    
    static clearLogs() {
        try {
            localStorage.removeItem('quiz-platform-logs');
            Logger.info('Logs cleared');
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

class Utils {
    /**
     * Safely get element by selector with error handling
     */
    static safeGetElement(selector, required = true) {
        try {
            Logger.debug(`Getting element: ${selector}`);
            const element = document.querySelector(selector);
            
            if (required && !element) {
                const error = new Error(`${CONFIG.ERRORS.ELEMENT_NOT_FOUND}: ${selector}`);
                Logger.error(`Required element not found: ${selector}`, error);
                throw error;
            }
            
            if (element) {
                Logger.debug(`Element found: ${selector}`);
            } else {
                Logger.debug(`Optional element not found: ${selector}`);
            }
            
            return element;
        } catch (error) {
            Logger.error(`Error getting element ${selector}`, error);
            if (required) {
                throw error;
            }
            return null;
        }
    }
    
    /**
     * Safely set element content with error handling
     */
    static safeSetContent(selector, content, isHTML = false) {
        try {
            Logger.debug(`Setting content for: ${selector}`);
            const element = this.safeGetElement(selector, true);
            
            if (isHTML) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
            
            Logger.debug(`Content set successfully for ${selector}`);
        } catch (error) {
            Logger.error(`Error setting content for ${selector}`, error);
            throw error;
        }
    }
    
    /**
     * Safely show/hide elements
     */
    static safeToggleDisplay(selector, show = true) {
        try {
            Logger.debug(`${show ? 'Showing' : 'Hiding'} element: ${selector}`);
            const element = this.safeGetElement(selector, true);
            element.style.display = show ? 'block' : 'none';
            Logger.debug(`Element ${selector} ${show ? 'shown' : 'hidden'} successfully`);
        } catch (error) {
            Logger.error(`Error toggling display for ${selector}`, error);
        }
    }
    
    /**
     * Validate survey data structure
     */
    static validateSurveyData(survey) {
        try {
            if (!survey || typeof survey !== 'object') {
                Logger.error('Survey data is not an object', survey);
                return false;
            }
            
            const required = ['id', 'title', 'description', 'questionsFile'];
            const missing = required.filter(field => !survey[field]);
            
            if (missing.length > 0) {
                Logger.error(`Missing required survey fields: ${missing.join(', ')}`, survey);
                return false;
            }
            
            Logger.debug(`Survey validation passed for: ${survey.id}`);
            return true;
        } catch (error) {
            Logger.error('Error validating survey data', error);
            return false;
        }
    }
    
    /**
     * Validate question data structure
     */
    static validateQuestionData(question) {
        try {
            if (!question || typeof question !== 'object') {
                Logger.error('Question data is not an object', question);
                return false;
            }
            
            const required = ['type', 'name', 'title', 'choices', 'correctAnswer'];
            const missing = required.filter(field => {
                if (question[field] === undefined || question[field] === null) {
                    return true;
                }
                if (field === 'choices' && (!Array.isArray(question[field]) || question[field].length === 0)) {
                    return true;
                }
                return false;
            });
            
            if (missing.length > 0) {
                Logger.error(`Missing required question fields: ${missing.join(', ')}`, question);
                return false;
            }
            
            Logger.debug(`Question validation passed for: ${question.name}`);
            return true;
        } catch (error) {
            Logger.error('Error validating question data', error);
            return false;
        }
    }
    
    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    static shuffleArray(array) {
        try {
            if (!Array.isArray(array)) {
                Logger.error('shuffleArray: Input is not an array', array);
                return [];
            }
            
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            Logger.debug(`Shuffled array of ${shuffled.length} items`);
            return shuffled;
        } catch (error) {
            Logger.error('Error shuffling array', error);
            return array || [];
        }
    }
    
    /**
     * Format time in MM:SS format
     */
    static formatTime(seconds) {
        try {
            if (!Number.isInteger(seconds) || seconds < 0) {
                Logger.warn('formatTime: Invalid seconds value', seconds);
                return '0:00';
            }
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
        } catch (error) {
            Logger.error('Error formatting time', error);
            return '0:00';
        }
    }
    
    /**
     * Debounce function to limit rapid calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Retry async operation with exponential backoff
     */
    static async retryAsync(operation, maxAttempts = CONFIG.RETRY_ATTEMPTS, baseDelay = CONFIG.RETRY_DELAY) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                Logger.debug(`Attempting operation (attempt ${attempt}/${maxAttempts})`);
                return await operation();
            } catch (error) {
                Logger.warn(`Operation failed on attempt ${attempt}`, error);
                
                if (attempt === maxAttempts) {
                    Logger.error('All retry attempts exhausted', error);
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                Logger.debug(`Waiting ${delay}ms before retry`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    /**
     * Safe JSON parse with error handling
     */
    static safeJsonParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            Logger.error('JSON parse error', error);
            return defaultValue;
        }
    }
    
    /**
     * Safe fetch with timeout and error handling
     */
    static async safeFetch(url, options = {}, timeout = 10000) {
        try {
            Logger.debug(`Fetching: ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            Logger.debug(`Fetch successful: ${url}`);
            return response;
        } catch (error) {
            if (error.name === 'AbortError') {
                Logger.error(`Fetch timeout: ${url}`, error);
                throw new Error(`Request timeout: ${url}`);
            }
            Logger.error(`Fetch error: ${url}`, error);
            throw error;
        }
    }
}

// =============================================================================
// CATEGORY STRUCTURE DEFINITION
// =============================================================================

const categoryStructure = {
    "programming": {
        title: "Programming Languages",
        icon: "💻",
        color: "#3776ab",
        description: "Master programming language internals and advanced concepts",
        subcategories: {
            "python": {
                title: "Python Programming",
                icon: "🐍",
                color: "#3776ab",
                description: "Python language features, internals, and advanced patterns"
            },
            "jvm": {
                title: "JVM & Java",
                icon: "☕",
                color: "#ed8b00",
                description: "Java Virtual Machine architecture and optimization"
            },
            "golang": {
                title: "Go Language",
                icon: "🔷",
                color: "#00add8",
                description: "Go runtime, concurrency, and performance"
            },
            "scala": {
                title: "Scala Slick",
                icon: "🔶",
                color: "#e67e22",
                description: "Scala Slick for functional relational mapping"
            }
        }
    },
    "algorithms": {
        title: "Data Structures & Algorithms",
        icon: "📊",
        color: "#ff6b35",
        description: "Master fundamental and advanced algorithms for coding interviews",
        subcategories: {
            "leetcode": {
                title: "LeetCode Problems",
                icon: "💻",
                color: "#f39c12",
                description: "Coding interview problems and algorithmic patterns"
            },
            "data-structures": {
                title: "Data Structures",
                icon: "📊",
                color: "#ff6b35",
                description: "Advanced data structures and their implementations"
            },
            "advanced": {
                title: "Advanced Algorithms",
                icon: "🧠",
                color: "#9b59b6",
                description: "Complex algorithmic concepts and optimization techniques"
            }
        }
    },
    "cloud": {
        title: "Cloud & Infrastructure",
        icon: "☁️",
        color: "#ff9900",
        description: "Cloud platforms, infrastructure, and DevOps practices",
        subcategories: {
            "aws": {
                title: "Amazon Web Services",
                icon: "🔶",
                color: "#ff9900",
                description: "AWS services, security, and best practices"
            },
            "kubernetes": {
                title: "Kubernetes",
                icon: "⚙️",
                color: "#326ce5",
                description: "Container orchestration and management"
            },
            "terraform": {
                title: "Infrastructure as Code",
                icon: "🏗️",
                color: "#623ce4",
                description: "Terraform, Terragrunt, and IaC principles"
            }
        }
    },
    "data": {
        title: "Data Engineering",
        icon: "🔄",
        color: "#017cee",
        description: "Data pipelines, workflow orchestration, and big data technologies",
        subcategories: {
            "workflow": {
                title: "Workflow Orchestration",
                icon: "🌊",
                color: "#017cee",
                description: "Apache Airflow and data pipeline management"
            }
        }
    },
    "finance": {
        title: "Financial Technology",
        icon: "💰",
        color: "#f7931a",
        description: "Trading systems, financial instruments, and risk management",
        subcategories: {
            "crypto": { 
                title: "Cryptocurrency Trading",
                icon: "₿",
                color: "#f7931a",
                description: "Crypto derivatives, trading strategies, and market mechanics"
            },
            "oms": {
                title: "Order Management Systems",
                icon: "📦",
                color: "#f7931a",
                description: "OMS architecture, order routing, and trade execution"
            },
            "trading": {
                title: "Trading Systems & FIX Protocol",
                icon: "📊",
                color: "#2e8b57",
                description: "OMS design, FIX protocol, and exchange connectivity"
            }
        }
    },
    "messaging": {
        title: "Messaging & Event Streaming",
        icon: "📨",
        color: "#231f20",
        description: "Distributed messaging systems, event streaming, and message brokers",
        subcategories: {
            "kafka": {
                title: "Apache Kafka",
                icon: "🚀",
                color: "#231f20",
                description: "Distributed event streaming platform and messaging patterns"
            },
            "jms": {
                title: "JMS & Message Brokers",
                icon: "📬",
                color: "#4a90e2",
                description: "Java Message Service and traditional message brokers"
            }
        }
    }
};

// =============================================================================
// INITIALIZE PLATFORM STATE
// =============================================================================

const platformState = new QuizPlatformState();

// Initialize logging
Logger.info(`Quiz Platform v${CONFIG.VERSION} initialized`);
Logger.debug('Configuration', CONFIG);

// Export for global access
window.QuizPlatform = {
    Utils,
    Logger,
    platformState,
    CONFIG,
    categoryStructure
};
