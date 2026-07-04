# StreamHop 🎬

StreamHop is a full stack web app which allows users to get up-to-date information regarding global trends and favorite movies, at the same time giving them access to find out how they can stream their favorite films in their region.

---

##  Live Demo

https://streamhop.vercel.app/

---

##  Features


* **Global Trends, Local Perspective:** Showcases the global top trending movies of the day, automatically changing streaming provider according to the selected country by the user.
* **Global Movie Search Engine:** Real-time global movie search engine which has huge data of movies stored in it.
* **Interactive Watch Hub Buttons:** Streamlined links embedded in streaming platform logos leading to their respective watch hub pages.
* **User Authentication & Favorites:** Integrated authentication system which enables movie lovers to add their favorite movies on a cloud-based watchlist.

---

##  Tech Stack

### Frontend
* **React.js** – Component-based UI 
* **Axios** – Client-side HTTP requests 
* **CSS3** – Custom responsive styling and hover interactions 

### Backend
* **Node.js & Express** – RESTful API architecture and routing
* **CORS** – Secure cross-origin resource sharing controls

### Database & Third-Party APIs
* **Firebase Firestore** – Real-time cloud database for user watchlists
* **Firebase Auth** – Secure client-side user session management
* **TMDB API** – Global film metadata, popularity metrics, and localized streaming provider logic


## Project Deliverables & Repository Link

* **Public Repository URL:** https://github.com/mirceaulariu/movie-app.git
* **URL:** https://streamhop.vercel.app/
* **Source Code Integrity:** All the necessary source code components for the frontend client and backend proxy server are contained within this codebase. It is ensured that all compiled files and dependencies, including `node_modules`, are securely ignored from the codebase repository using `.gitignore`.

---

##  Application Build Steps

The application is designed to be decoupled comprising of a front-end client (`frontend`) and a back-end proxy gateway (`backend`). Make sure that you have **Node.js (version 18 or above)** installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/mirceaulariu/movie-app.git
cd movie-app
```

### 2. Build the Backend Server
```bash
cd backend
npm install
```

### 3. Build the Frontend Client
```bash
cd ../frontend
npm install
npm run build
```
*(Build phase will compile the React application and generate highly optimized static assets for production purposes).*

---

## Application Installation and Launch Steps

### Local

Take the following operations into account while configuring the variables and running the whole application process locally:

### 1. Configure Environment Secrets
Create an `.env` configuration file in both directories for injecting the runtime parameters in a secure manner:

* **In `/backend/.env`:**
    ```env
    PORT=5000
    TMDB_API_KEY=your_tmdb_api_key_here
    ```
* **In `/frontend/.env`:**
    ```env
    REACT_APP_FIREBASE_API_KEY=your_firebase_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    ```

### 2. Start the Application

Two terminals will be required to start the full stack simultaneously:

#### Terminal 1: Launch the Backend Gateway
```bash
cd backend
node server.js
```
*The Node/Express environment will start by default and listen for requests coming from clients using `http://localhost:5000`.*

#### Terminal 2: Launch the Frontend 
```bash
cd client
npm start
```
*The development server will start and open the application shell in your default web browser at `http://localhost:3000`.*