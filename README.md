# quiz-app
Quiz App is an interactive, browser-based quiz application focused on real-time knowledge evaluation in the field of Advertising Technology (AdTech).

## 1. Frontend Application

**Technology Stack:** HTML, CSS, JavaScript

**Features:** User onboarding, question rendering, timer management, option selection, answer submission, score display, and leaderboard rendering

**Deployment:** AWS S3 static website hosting with public read access enabled

## 2. Backend API Layer

**Technology:** AWS Lambda (Python 3.12)

**API Exposure**: AWS API Gateway

**Core Endpoints:**

GET /question: Serves the next available question in order

POST /bid-response: Accepts and evaluates user responses

**Deployment:** AWS Serverless Application Model (SAM CLI)

**Security:** CORS headers for cross-origin browser access

## 3. Data Persistence

**Database:** AWS DynamoDB

**Tables Used:**

adtech_questions: Stores all questions and metadata

leaderboard: Stores per-user scores, latencies, and last update times




