# Quiz Platform - Category Structure

The quiz platform has been enhanced with a hierarchical category and subcategory navigation system.

## Navigation Flow

1. **Home Page** → Shows main categories
2. **Category Page** → Shows subcategories within a category  
3. **Quiz List Page** → Shows individual quizzes within a subcategory
4. **Quiz Page** → The actual quiz interface

## Category Structure

### 1. Programming Languages 💻

- **Python Programming** 🐍
  - Python Internals Quiz
  - Python Dunder Methods & Magic
  - Python Type System & Memory
- **JVM & Java** ☕
  - JVM Internals Quiz
- **Go Language** 🔷
  - Go Language Internals Quiz

### 2. Data Structures & Algorithms 📊

- **LeetCode Problems** 💻
  - LeetCode Medium Problems - Python Solutions
- **Data Structures** 📊
  - Python Data Structures for LeetCode
- **Advanced Algorithms** 🧠
  - Advanced Data Structures - Python Coding

### 3. Cloud & Infrastructure ☁️

- **Amazon Web Services** 🔶
  - AWS EKS & Kubernetes Secrets Management
  - AWS IAM Policies & Cross-Account Permissions
- **Infrastructure as Code** 🏗️
  - Terraform HCL & Terragrunt Principles

### 4. Data Engineering 🔄

- **Workflow Orchestration** 🌊
  - Apache Airflow Programming & Concepts

### 5. Financial Technology 💰

- **Cryptocurrency Trading** ₿
  - Cryptocurrency Derivatives Trading

## Features

- **Breadcrumb Navigation**: Easy navigation back to previous levels
- **Smart Back Button**: Context-aware navigation
- **Visual Organization**: Color-coded categories and subcategories
- **Quiz Counts**: Shows available quiz counts at each level
- **Responsive Design**: Works on all device sizes

## Technical Implementation

- Categories are organized in JavaScript objects with metadata
- Each survey is mapped to a category and subcategory
- Navigation state is maintained for proper back button functionality
- Breadcrumbs provide clear navigation context
- Enhanced CSS for better visual hierarchy

## Usage

1. Start from the home page showing main categories
2. Click a category to see its subcategories
3. Click a subcategory to see available quizzes
4. Click a quiz to start the assessment
5. Use breadcrumbs or back button to navigate back at any time

The platform now provides a much better user experience with logical grouping and easy navigation between different types of technical assessments.
