#DevNet

- Created vite + react, install tailwind, daisy ui, react-router-dom, axios
- Create BrowserRouter and wrap app component in it
- Routes > Route=/ Body > RouteChildren
- Create and Outlet in your Body Componenet
- Create Signup page
- Create Login Page
- CORS - install cors in backend => add middleware to with configuration : origin: "http://localhost:5173", credentials: true, 
- Whenever we make API call pass (using axios) => {withCredentials: true}   -> if not pass causes: it will send send token to other api call
- install react-redux @reduxjs/toolkit
- create a utils folder => create store => wrap app component inside Provider => createSlice => add reducer to store
- update navbar features using useSelector() hook
- refactor our code to add constant file 
- should not access other routes without login
- if token is not present , redirect to login page
- Logout functionality on NavBar
- Profile page
- Get the feed and add the feed in the store
- build the user card on feed
- built my connections page
- built Connection Requests page









Body
    NavBar
    Route=/ => Feed 
    Route=/login => Login  
    Route=/connection => Connections
    Router=/profile => Profile





# Deployment

- Singup on AWS
- Launch instance
- update persmission on key file (.pem)
- Launch and connect to terminal by ( ssh -i C:\Users\xTheDaDx\Downloads\DevNet-secret.pem ubuntu@ec2-50-17-117-92.compute-1.amazonaws.com )
- Install same Node version as per this project
- Git clone our project repos
    - Frontend 
        - npm install -> dependencies install
        - npm run build
        - sudo apt update  
        - sudo apt install nginx  
        - sudo systemctl start nginx
        - sudo sytemctl enable nginx
        - Copy code from dist(build files) to /var/www/html/
        - sudo scp -r dist/* /var/www/html/
        - Enable port :80 of your instance

    - Backend 
        - npm install 
        - git pull if any changes
        - allowed ec2 instance public IP on mongodb server
        - npm install pm2 -g
        - pm2 start npm --name "devNetBackend" -- start
        - pm2 logs
        - pm2 list, pm2 flush <name> , pm2 stop <name>, pm2 delete <name>
        - config nginx - sudo nano /etc/nginx/sites-available/default
        - restart nginx - sudo systemctl restart nginx
        - modify the BASEURL in frontend project to "/api"

# Config nginx    

    Frontend = http://50.17.117.92/
    Backend = http://50.17.117.92:3000/


        server_name 50.17.117.92;

        # Proxy all /api requests to Node.js app
        location /api/ {
        proxy_pass http://localhost:3000/;

        # Optional but recommended headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        }


# Adding a custom domain name

    - purchased domain name from GoDaddy.com
    - Signup for cloudflare and copied cloudflare nameservers
    - Replaced default goDaddy nameservers with cloudflare's
    - Update Dns Records (in cloudflare)-
                A         devnet.co.in                  50.17.117.92           Proxied                 Auto
                CNAME      dcoyeamt---------            dcoy------             DNS only                Auto   
                CNAME       ---------------             ------------           DNS only                 Auto
                CNAME      www                          devnet.co.in           Proxied                 Auto
                TXT        devnet.co.in                  "v=DMARC--            DNS only                 Auto     
    - Update SSL for website



#  Setup Amazon SES
    - create a IAM user
    - Give Acess to AmazonSESFullAccess
    - Amazon SES: Create an Identity
    - Verify your domain name
    - Verify an email address
    - Install AWS SDK - V3 - https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/ses/src/ses_sendemail.js    
    - Setup SesClient
    - Access Credentials should be created in IAm under SecurityCredentials Tab
    - EC2 server and ses server should be same 
    - Add the credentials to the env file
    - Write code for SESClient
    - Write code for Sending email address
    - Make the email dynamic by passing more params to the run function
    - 
    


# Scheduling cron jobs in NodeJS
    - Installing node-cron
    - Learning about cron expressions syntax - crontab.guru
    - Schedule a job
    - date-fns
    - Find all the unique  email Id who have got connection Request in previous day
    - Send Email
    - Explore queue mechanim to send bulk emails    `
    - Amazon SES Bulk Emails
    - Make sendEmail function dynamic
    - bee-queue & bull npm packages

 
#  Razorpay Payment Gateway Inegration
    - Sign up on Razorpay & complete KYC 
    - Cerated a UI for premium page
    - Creating an API for create order in backend
    - added my key and secret in env file
    - Intialized Razorpay in utils
    - creating order on Razorpay
    - create Schema and model
    - saved the order in payments collection
    - make the API dynamic
    - Setup RRazorpay webhook on your live APi
    - Ref - https://github.com/razorpay/razorpay-node/tree/master/documents
    - Ref - https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#integrate-with-razorpay-payment-gateway
    - Ref - https://razorpay.com/docs/webhooks/validate-test/
    - Ref - https://razorpay.com/docs/webhooks/payloads/payments/



#   # 💬 DevNet Real-Time Chat Architecture

The DevNet chat engine is a robust, production-grade real-time messaging system built with the MERN stack and Socket.io. It goes beyond basic messaging by implementing advanced features like global presence tracking, robust read receipts (WhatsApp-style), offline catch-up synchronization, and secure media/file handling.

## ✨ Key Features

* **🟢 Global Online Presence:** Real-time online/offline status indicators that track users across the entire application, not just within the chat window.
* **✔️ WhatsApp-Style Read Receipts:** Highly accurate message status tracking:
  * Single Tick (✓): Sent to server.
  * Double Tick (✓✓): Delivered to the receiver's device.
  * Blue Double Tick (**✓✓ Read**): Message has been seen by the receiver.
* **🔄 Offline Catch-Up Sync:** If a user receives messages while completely offline, the backend instantly scans and updates pending deliveries the moment they reconnect, seamlessly syncing the sender's UI.
* **📎 Universal File Sharing:** Secure upload pipeline supporting both inline images and raw documents (PDFs, ZIPs, DOCs). Features dynamic UI rendering based on file type.
* **😀 Rich Text & Emojis:** Integrated emoji picker with native dark/light theme support.
* **💬 Typing Indicators:** Real-time "User is typing..." indicators with debounced timeouts to prevent UI flickering.
* **🔔 Global Push Notifications:** A Redux-powered notification bell that alerts users to new messages or connection requests while they are browsing other pages of the application.

---

## 🏗️ System Architecture & Workflow

### 1. Connection & Security
* **Deterministic Room IDs:** Private chat rooms are secured using a `crypto` SHA-256 hash of both users' sorted MongoDB Object IDs. This ensures User A and User B always connect to the exact same secure socket room without needing to store room IDs in the database.
* **Global `userSocketMap`:** The Node.js server maintains an active memory map of `userId` to `socket.id`. This allows the server to push notifications or delivery receipts to a user regardless of which page they are currently viewing.

### 2. The Message Lifecycle (Tick System)
1. **Send:** The sender dispatches a payload. The backend saves it to MongoDB with a `status: "sent"` and broadcasts it to the room.
2. **Delivery (If Online):** The global listener on the receiver's client catches the message and instantly fires a `markMessageDelivered` event back to the server. The server updates the database atomically using `$elemMatch` and notifies the sender to display `✓✓`.
3. **Delivery (If Offline):** When the receiver eventually logs in, the `registerUser` event triggers a database sweep for any pending "sent" messages, updates them, and pushes the delivery receipts to the senders.
4. **Read:** Once the receiver explicitly opens the active chat window, a `markMessagesSeen` event fires, turning the ticks blue.

### 3. Secure File Upload Pipeline
Raw files are **never** sent over WebSockets. DevNet utilizes a secure 3-step proxy architecture:
1. **Frontend:** React intercepts the file and posts it to a protected Express route via `multipart/form-data`.
2. **Backend (Multer):** Node.js holds the file securely in RAM using `multer.memoryStorage()`, preventing local disk bloat.
3. **Cloud Storage (Cloudinary):** The buffer is securely streamed to Cloudinary with `resource_type: "auto"` to support all extensions. The secure URL and original filename are returned to the server and relayed to the chat room.

### 4. Client-Side Deduplication
To handle the complexities of React StrictMode and Socket.io reconnections, the frontend utilizes a JavaScript `Set()` (`processedMessagesRef`) to index incoming message IDs. This guarantees a flawlessly smooth UI with zero duplicate message renders.

---

## 🛠️ Tech Stack & Libraries

* **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io (`socket.io`), Crypto
* **Frontend:** React, Redux Toolkit, React Router, Socket.io-client, Axios, Tailwind CSS, daisyUI
* **Media Processing:** Multer (Memory Storage), Cloudinary API
* **UI Components:** `emoji-picker-react`    