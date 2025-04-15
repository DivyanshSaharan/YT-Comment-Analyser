# VibeCheck: YouTube Comment Analyzer

![Banner](frontend/src/assets/banner.jpg)

*“Unlocking the true sentiment behind YouTube comments to empower creators with actionable insights for better content and viewer engagement.”*

---

## 🌐 [Live Deployment](https://yt-comment-analyser-frontend.onrender.com/)  



## 📚 Table of Contents

1. [Introduction](#introduction)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Setup and Installation](#setup-and-installation)  
5. [Usage](#usage)

---

## 🧠 Introduction

**VibeCheck** is a sentiment analysis platform that classifies YouTube video comments into positive, neutral, or negative sentiments. Based on these sentiments, it generates a weighted average rating, helping creators better understand viewer feedback and engagement.

---

## 🚀 Features

- Fetches video metadata like title, channel name, views, and likes using the YouTube API.
- Analyzes up to 1000 comments per video using ML-powered sentiment analysis.
- Calculates a sentiment-based weighted rating.
- Offers insights to improve content and boost viewer satisfaction.

---

## 🛠️ Technologies Used

- **Frontend**: React.js  
- **Backend**: Flask (Python)  
- **ML Model**: TensorFlow (Bi-directional GRU with Attention Layer)  
- **API**: YouTube Data API v3  
- **Containerization**: Docker, Docker Compose  

---

## 🧰 Setup and Installation

### Prerequisites

- Docker & Docker Compose installed on your system  
- A YouTube Data API key from [Google Developer Console](https://console.developers.google.com)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/DivyanshSaharan/YT-Comment-Analyser.git
   cd vibecheck
   ```

2. **Create a .env file in the python-backend/ directory and add your API key:**

   ```bash
   DEVELOPER_KEY=your_youtube_api_key
   ```

3. **Build and run the project using Docker Compose:**

   ```bash
   docker-compose up --build
   ```

4. **Visit the app in your browser:**

   ```bash
   http://localhost:3000
   ```

## 🧪 Usage
- Enter a valid **YouTube video URL** in the input field.
- Click the **Analyze** button. 
- Wait for the system to fetch comments and generate sentiment insights.
- View the **sentiment distribution, overall score, and suggestions.**
