# quiz-app
## 1. Frontend Application

**Technology Stack:** HTML, CSS, JavaScript (Vanilla)

**Features:** User onboarding, question rendering, timer management, option selection, answer submission, score display, and leaderboard rendering

**Deployment:** AWS S3 static website hosting with public read access enabled

## 2. Backend API Layer

**Technology:** AWS Lambda (Python 3.12)

**API Exposure**: AWS API Gateway

**Core Endpoints:**

GET /question: Serves the next available question in order

POST /bid-response: Accepts and evaluates user responses

**Deployment Toolchain:** AWS Serverless Application Model (SAM CLI)

**Security:** CORS headers for cross-origin browser access; no authentication in initial release

## 3. Data Persistence

**Database:** AWS DynamoDB

**Tables Used:**

adtech_questions: Stores all questions and metadata

leaderboard: Stores per-user scores, latencies, and last update times



## 4. Deployment Steps

**Backend Deployment via AWS SAM CLI**

Run sam build in the backend/ directory to compile dependencies and package source code.

Deploy using sam deploy --guided, providing:

Stack name

Region (e.g., ap-south-1)

S3 bucket for deployment artifacts

Table names as parameters

**Frontend Deployment via AWS S3**

Create an S3 bucket with a unique name and public access enabled

Enable static website hosting and set index.html as the root document

Upload frontend files using:

aws s3 sync ./frontend s3://bucket-name --delete

Apply the necessary bucket policy to allow public read access

Access the game via the provided static site endpoint
