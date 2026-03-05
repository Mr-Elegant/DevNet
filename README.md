# 🕸️ DevNet - The Ultimate Developer Networking Platform

DevNet is a full-stack, production-grade social networking and community platform built exclusively for developers. It combines the engaging UX of modern dating apps (Tinder-style swiping) with the deep technical requirements of software engineering (Code snippets, Markdown blogs, Portfolios, and Real-time WebSockets).

---

## ✨ Core Features & Architecture

### 🚀 1. Matchmaking (Tinder-Style Swiping)
* **Interactive Swipe Deck:** Buttery-smooth spring-physics card swiping using `react-tinder-card`.
* **Dynamic Feedback Stamps:** Physical-feeling "LIKE" and "NOPE" stamp overlays that react to drag distance and intent.
* **Instant Notifications:** A right-swipe instantly triggers a global push notification via WebSockets to the target user.

### 💬 2. Real-Time Chat Engine (WhatsApp-Style)
* **Global Online Presence:** Real-time online/offline status indicators tracked globally across the app.
* **Advanced Read Receipts:** Highly accurate message status tracking (✓ Sent, ✓✓ Delivered, **✓✓ Read**).
* **Offline Catch-Up Sync:** Backend listener instantly syncs and updates pending deliveries the moment a user reconnects.
* **Universal File Sharing:** Secure upload pipeline via Cloudinary supporting images, PDFs, ZIPs, and DOCs.
* **Security:** Deterministic private room IDs secured using a `crypto` SHA-256 hash of both users' MongoDB Object IDs.

### 🌐 3. Polymorphic Developer Community Feed
* **Unified Post Architecture:** A single MongoDB model powering four distinct content types:
  * **⚡ Dev Logs:** Short-form updates with syntax-highlighted code blocks.
  * **📝 Articles:** Long-form, Markdown-supported tutorials.
  * **🐛 Q&A / Bug Squashing:** StackOverflow-style questions where the author can mark comments as the "Accepted Answer".
  * **🚀 Project Launches:** Automated rich-media cards showcasing new portfolio additions.
* **Optimistic UI Updates:** Likes and comments update instantly on the screen while the API processes in the background.

### 💻 4. Developer Portfolios
* **Visual Showcases:** Users can upload app screenshots, add live deployment URLs, and link GitHub repositories.
* **Tech Stack Badges:** Auto-formatted tag generation for languages and frameworks used.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Redux Toolkit, React Router, Tailwind CSS, daisyUI.
* **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, Crypto.
* **Cloud & DevOps:** AWS EC2, Nginx, PM2, Cloudflare (DNS/SSL).
* **Microservices:** AWS SES (Emails), node-cron & bee-queue (Job Scheduling), Cloudinary (Media), Razorpay (Payments).

---

## 🚀 Local Development Setup (Step-by-Step)

Follow these steps to run the DevNet environment on your local machine.

**1. Clone the repository & Install Dependencies**
```bash
git clone [https://github.com/Mr_Eleagnt/DevNet.git](https://github.com/Mr_Elegant/DevNet.git)
cd DevNet

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies (Using legacy-peer-deps for React 19 compatibility)
cd ../frontend
npm install --legacy-peer-deps