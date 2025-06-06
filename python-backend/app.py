import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import re
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from comment_analyzer import analyze_comments

# Load env variables
load_dotenv()
DEVELOPER_KEY = os.getenv('DEVELOPER_KEY')

# Flask setup
app = Flask(__name__)
CORS(app)

# Initialize Spark session
spark = SparkSession.builder \
    .appName("YouTubeCommentAnalysis") \
    .master("local[*]") \
    .config("spark.executor.memory", "8g") \
    .config("spark.driver.memory", "8g") \
    .config("spark.executor.cores", "4") \
    .config("spark.network.timeout", "600s") \
    .config("spark.hadoop.security.authentication", "simple") \
    .config("spark.ui.showConsoleProgress", "false") \
    .getOrCreate()


def extract_video_id(youtube_url):
    video_id_match = re.match(r'.*v=([^&]*)', youtube_url)
    if video_id_match:
        return video_id_match.group(1)
    return None

def get_video_details(video_id):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    try:
        response = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        ).execute()

        if response["items"]:
            video = response["items"][0]
            return {
                "video_title": video["snippet"]["title"],
                "channel_name": video["snippet"]["channelTitle"],
                "view_count": video["statistics"].get("viewCount"),
                "like_count": video["statistics"].get("likeCount"),
                "thumbnail_url": video["snippet"]["thumbnails"]["high"]["url"]
            }
        else:
            return None
    except HttpError as error:
        print(f"An HTTP error {error.status_code} occurred:\n{error.content}")
        return None

def get_comments(video_id, part="snippet", max_results=100):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    comments = []
    next_page_token = None

    try:
        while len(comments) < max_results:
            request = youtube.commentThreads().list(
                part=part,
                videoId=video_id,
                textFormat="plainText",
                maxResults=min(100, max_results - len(comments)),
                pageToken=next_page_token
            )
            response = request.execute()

            for item in response["items"]:
                comment = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "comment": comment["textDisplay"],
                    "num_of_likes": comment["likeCount"],
                    "timestamp": comment["publishedAt"]
                })
                if len(comments) >= max_results:
                    break

            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

        return comments

    except HttpError as error:
        print(f"An HTTP error {error.status_code} occurred:\n{error.content}")
        return None

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    youtube_link = data.get('youtubeLink')
    video_id = extract_video_id(youtube_link)

    if video_id:
        video_details = get_video_details(video_id)
        comments = get_comments(video_id)

        if comments:
            df = pd.DataFrame(comments)
            df = df.sort_values(by=['num_of_likes'], ascending=False)

            # Sentiment analysis using Spark
            analyzed_comments = analyze_comments(comments)

            return jsonify({
                "video_details": video_details,
                "analyzed_comments": analyzed_comments
            })

        return jsonify({"error": "Error: Could not retrieve comments from video."}), 500
    else:
        return jsonify({"error": "Invalid YouTube link provided."}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
