# 🚀 DevNet: The Ultimate Collaboration Hub for Developers

**DevNet** is a full-stack, real-time social networking and portfolio-sharing platform built exclusively for developers. It fuses the rapid-discovery mechanics of modern social apps with the professional utility of a developer-first ecosystem, allowing users to connect, showcase their work, and collaborate in real-time.

## ✨ Key Features

*   **Seamless Authentication:**
    *   **Social Login:** One-click user onboarding with Google and GitHub OAuth 2.0, powered by Passport.js.
    *   **Secure JWT Sessions:** Traditional email/password authentication using `httpOnly` cookies for robust security against XSS attacks.

*   **Real-Time Chat Engine:**
    *   **Instant Messaging:** High-performance, low-latency 1-on-1 messaging built with Socket.IO.
    *   **Rich Presence:** Real-time online/offline status indicators and "is typing..." feedback.
    *   **Message Lifecycle:** Confidently track messages with sent, delivered, and seen read receipts.
    *   **File & Image Sharing:** Securely upload and share media via Cloudinary, with support for images, PDFs, and other file types.

*   **Collaborative Whiteboard:**
    *   **Live Drawing:** A fully-featured, real-time collaborative canvas powered by `tldraw`.
    *   **Instant Invitations:** Invite a user to a whiteboard session directly from the chat window with a single click.
    *   **Scalable Architecture:** Built on a Redis-backed Socket.IO adapter to support multiple server instances and ensure seamless collaboration.

*   **Developer Discovery & Networking:**
    *   **Tinder-Style Swiping:** Discover and connect with other developers through an intuitive, card-based swiping interface.
    *   **Connection Management:** View pending, incoming, and accepted connection requests in a clean, organized dashboard.

*   **Global Community Feed:**
    *   **Rich Content Creation:** Share updates, ask technical questions, or showcase projects with support for Markdown, code snippets (with syntax highlighting), and image attachments.
    *   **Interactive Q&A:** Facilitate knowledge sharing with nested comments, replies, and a Stack Overflow-style "Accepted Answer" feature.

*   **Advanced Developer Profiles:**
    *   **Portfolio Showcase:** Upload and manage personal projects, complete with titles, descriptions, live URLs, and image galleries.
    *   **GitHub Integration:** Automatically fetch and display a user's top GitHub repositories and contribution stats directly on their profile.

*   **Monetization & Premium Features:**
    *   **Secure Payments:** Integrated with Razorpay for processing Silver and Gold tier membership subscriptions.
    *   **Webhook Validation:** Cryptographically secured webhooks to reliably handle payment success and failure events.
    *   **Exclusive Badges:** Premium users receive a verified badge next to their name across the platform.

*   **Smart Notifications & Background Jobs:**
    *   **Real-Time Alerts:** In-app notification badges for new messages and connection requests.
    *   **Email Digests:** A background Node-Cron job sends daily summary emails via AWS SES to users with pending requests, ensuring they never miss a connection.

---

## 🛠️ Tech Stack

| Category           | Technology / Service                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | React (with Hooks), Vite, Redux Toolkit, React Router, Tailwind CSS, DaisyUI, Framer Motion, `tldraw`             |
| **Backend**        | Node.js, Express.js                                                                                              |
| **Database**       | MongoDB (with Mongoose ORM)                                                                                      |
| **Real-Time Sync** | Socket.IO, Redis (for Pub/Sub scaling), `react-tinder-card`                                                      |
| **Authentication** | JWT (in `httpOnly` cookies), Passport.js (for Google & GitHub OAuth), bcrypt                                     |
| **File Storage**   | Cloudinary (for images, PDFs, etc.)                                                                              |
| **Payments**       | Razorpay (with webhook validation)                                                                               |
| **Transactional Emails** | AWS Simple Email Service (SES)                                                                                   |
| **Background Jobs**| Node-Cron                                                                                                        |

---

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB (Local instance or MongoDB Atlas cluster)
* Redis (Local instance via Docker or native install)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/devnet.git # Replace with your repo URL
cd devnet
```

### 2. Environment Variables
Create a `.env` file in the root of your **backend** directory and add the following keys. You will need to obtain API keys from MongoDB, AWS, Razorpay, and Cloudinary:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Real-time Scaling (Optional for local, required for production)
REDIS_URL=rediss://default:password@endpoint.upstash.io:port

# Authentication
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# URLs
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

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
```

### 3. Install Dependencies
Open two terminal windows/tabs—one for the frontend and one for the backend.

**Backend Terminal:**
```bash
cd backend
npm install
```

**Frontend Terminal:**
```bash
cd frontend/devNet
npm install --legacy-peer-deps
```

### 4. Run the Application

**Start the Backend server (runs on port 3000):**
```bash
cd backend
npm run dev
```

**Start the Frontend development server (runs on port 5173):**
```bash
cd frontend/devNet
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to see the app running!

---

## 🏗️ Architecture & Deployment

DevNet is designed to be deployed on an **AWS EC2 instance**.
* **Reverse Proxy:** Nginx is used on port 80 to serve the static frontend `dist` build and proxy `/api` and WebSocket requests to the Node.js backend running on port 3000.
* **Process Management:** PM2 is recommended for keeping the backend Node.js process alive in production.

---

> **Note:** This project relies on a daily Cron job to send email digests. Ensure your production server timezone is configured correctly so that emails dispatch at the intended local time (8:00 AM).