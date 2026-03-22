# 🚀 DevNet: The MatchMaker for Developers

**DevNet** is a full-stack, real-time social networking and portfolio-sharing platform built exclusively for developers. It combines the discovery mechanics of modern dating apps with the professional networking power of LinkedIn, allowing developers to connect, share code, collaborate on projects, and chat in real-time.

## ✨ Key Features

* **Developer Discovery (Swiping Feed):** Discover new developers via a Tinder-style swiping interface. Swipe right to send a connection request, or left to ignore.
* **Real-Time Chat Engine:** Instant 1-on-1 messaging powered by Socket.io, complete with online/offline status indicators, typing indicators, read receipts, and file/image sharing.
* **Global Community Feed:** Share updates, ask technical questions, or launch projects. Includes support for code snippets with syntax highlighting, image attachments, nested comments, and "Accepted Answer" Q&A mechanics.
* **Advanced User Profiles:** * **Portfolio Manager:** Upload and showcase personal projects with live URLs and screenshots.
    * **GitHub Integration:** Link your GitHub account to automatically display your top repositories and stats directly on your profile.
* **Premium Memberships:** Monetization via Razorpay integration, offering Silver and Gold tiers for exclusive platform features and verified profile badges.
* **Smart Notifications & Emails:** In-app real-time notification badges, plus a background Node-Cron job that sends daily digest emails via AWS SES to users with pending connection requests.

---

## 🛠️ Tech Stack

**Frontend**
* **Framework:** React 19 (Vite)
* **Styling:** Tailwind CSS v4 & DaisyUI
* **State Management:** Redux Toolkit (Separated slices for user, feed, connections, requests, themes, and notifications)
* **Routing:** React Router v7
* **Real-time & Animation:** Socket.io-client, Framer Motion, React Tinder Card

**Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ORM)
* **Authentication:** JWT (JSON Web Tokens) stored in `httpOnly` cookies & bcrypt password hashing
* **Real-time:** Socket.io

**Cloud & Third-Party Services**
* **AWS SES:** Automated daily transactional emails.
* **Cloudinary:** Secure image and file storage for profiles and chats.
* **Razorpay:** Payment gateway processing and webhooks.

---

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB (Local instance or MongoDB Atlas cluster)

### 2. Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/devnet.git
cd devnet
\`\`\`

### 3. Environment Variables
Create a `.env` file in the root of your **backend** directory and add the following keys. You will need to obtain API keys from MongoDB, AWS, Razorpay, and Cloudinary:

\`\`\`env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# AWS SES (Emails)
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=ap-south-1

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_custom_webhook_secret

# Cloudinary (Image/File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
\`\`\`

### 4. Install Dependencies
Open two terminal windows/tabs—one for the frontend and one for the backend.

**Backend Terminal:**
\`\`\`bash
cd backend
npm install
\`\`\`

**Frontend Terminal:**
\`\`\`bash
cd frontend
npm install
\`\`\`

### 5. Run the Application

**Start the Backend server (runs on port 3000):**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Start the Frontend development server (runs on port 5173):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Open your browser and navigate to `http://localhost:5173` to see the app running!

---

## 🏗️ Architecture & Deployment

DevNet is designed to be deployed on an AWS EC2 instance. 
* **Reverse Proxy:** Nginx is used on port 80 to serve the static frontend `dist` build and proxy `/api` and WebSocket requests to the Node.js backend running on port 3000.
* **Process Management:** PM2 is recommended for keeping the backend Node.js process alive in production.

---

> **Note:** This project relies on a daily Cron job to send email digests. Ensure your production server timezone is configured correctly so that emails dispatch at the intended local time (8:00 AM).