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