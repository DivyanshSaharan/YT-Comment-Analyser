import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import re
from dotenv import load_dotenv
from comment_analyzer import analyze_comments

load_dotenv()
DEVELOPER_KEY = os.getenv('DEVELOPER_KEY')

app = Flask(__name__)
CORS(app)  # To allow cross-origin requests from React

def extract_video_id(youtube_url):
    """
    Extract the video ID from a full YouTube URL.
    """
    video_id_match = re.match(r'.*v=([^&]*)', youtube_url)
    if video_id_match:
        return video_id_match.group(1)
    return None

def get_video_details(video_id):
    """
    Function to get video details like title, channel name, views, and likes.
    """
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)

    try:
        response = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        ).execute()

        if response["items"]:
            video = response["items"][0]
            video_details = {
                "video_title": video["snippet"]["title"],
                "channel_name": video["snippet"]["channelTitle"],
                "view_count": video["statistics"].get("viewCount"),
                "like_count": video["statistics"].get("likeCount"),
                "thumbnail_url": video["snippet"]["thumbnails"]["high"]["url"]
            }
            return video_details
        else:
            return None
    except HttpError as error:
        print(f"An HTTP error {error.status_code} occurred:\n{error.content}")
        return None

def get_comments(video_id, part="snippet", max_results=1000):
    """
    Function to get comments from a YouTube video
    """
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)

    try:
        # Retrieve comment thread using the youtube.commentThreads().list() method
        response = youtube.commentThreads().list(
            part=part,
            videoId=video_id,
            textFormat="plainText",
            maxResults=max_results
        ).execute()

        comments = []
        for item in response["items"]:
            comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            likes = item["snippet"]["topLevelComment"]["snippet"]["likeCount"]
            timestamp = item["snippet"]["topLevelComment"]["snippet"]['publishedAt']
            comments.append({"comment": comment_text, "num_of_likes": likes , "timestamp":timestamp})

        return comments
    except HttpError as error:
        print(f"An HTTP error {error.status_code} occurred:\n {error.content}")
        return None

@app.route('/analyze', methods=['POST'])
def analyze():
    # Get the YouTube link from the request
    data = request.get_json()
    youtube_link = data.get('youtubeLink')

    # Extract the video ID from the YouTube link
    video_id = extract_video_id(youtube_link)

    if video_id:
        video_details = get_video_details(video_id)
        # Get comments from the video
        comments = get_comments(video_id)

        if comments:
            df = pd.DataFrame(comments)
            df = df.sort_values(by=['num_of_likes'], ascending=False)

            # Analyze the comments for sentiment
            analyzed_comments = analyze_comments(comments)

            # Return all comments with sentiment analysis as a JSON response
            return jsonify({"video_details": video_details,"analyzed_comments": analyzed_comments})

        return jsonify({"error": "Error: Could not retrieve comments from video."}), 500
    else:
        return jsonify({"error": "Invalid YouTube link provided."}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
