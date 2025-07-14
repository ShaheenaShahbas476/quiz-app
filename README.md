# quiz-app
Quiz App is an interactive, browser-based quiz application focused on real-time knowledge evaluation in the field of Advertising Technology.

## Features
1. User onboarding with local name storage

2. Randomized multiple-choice questions per session

3. 30-second countdown timer for each question

4. Real-time scoring based on answer correctness

5. Latency tracking for fast-response encouragement

6. Live leaderboard with score and response stats

7. Fully responsive layout (desktop & mobile optimized)

8. Fast performance with stateless AWS Lambda backend

9. Scalable architecture using API Gateway + DynamoDB

10. Frontend hosted on AWS S3 (low-latency delivery)

11. Built and deployed using AWS SAM CLI (serverless)

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

**Deployment:** AWS Serverless Application Model(AWS SAM)

**Security:** CORS headers for cross-origin browser access

## 3. Data Persistence

**Database:** AWS DynamoDB

**Tables Used:**

adtech_questions: Stores all questions and metadata

leaderboard: Stores per-user scores, latencies, and last update times




