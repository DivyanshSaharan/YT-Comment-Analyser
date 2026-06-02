import os
import re

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask, jsonify, request
from flask_cors import CORS
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
from comment_analyzer import analyze_comments

load_dotenv()
DEVELOPER_KEY = os.getenv("DEVELOPER_KEY")

app = Flask(__name__)
CORS(app)

def extract_video_id(youtube_url):
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/)([^&?/]+)",
        r"youtube\.com/shorts/([^&?/]+)",
        r"youtube\.com/embed/([^&?/]+)",
    ]

    for pattern in patterns:
        video_id_match = re.search(pattern, youtube_url)
        if video_id_match:
            return video_id_match.group(1)


    return None


def get_video_details(video_id):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    try:
        response = youtube.videos().list(
            part="snippet,statistics",
            id=video_id,
        ).execute()

        if response["items"]:
            video = response["items"][0]
            return {
                "video_title": video["snippet"]["title"],
                "channel_name": video["snippet"]["channelTitle"],
                "view_count": video["statistics"].get("viewCount"),
                "like_count": video["statistics"].get("likeCount"),
                "thumbnail_url": video["snippet"]["thumbnails"]["high"]["url"],
            }

        return None
    except HttpError as error:
        app.logger.exception("YouTube video details request failed: %s", error)
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
                pageToken=next_page_token,
            )
            response = request.execute()

            for item in response["items"]:
                comment = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "comment": comment["textDisplay"],
                    "num_of_likes": comment["likeCount"],
                    "timestamp": comment["publishedAt"],
                })
                if len(comments) >= max_results:
                    break

            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

        return sorted(comments, key=lambda comment: comment["num_of_likes"], reverse=True)

    except HttpError as error:
        app.logger.exception("YouTube comments request failed: %s", error)
        return None


@app.route("/analyze", methods=["POST"])
def analyze():
    if not DEVELOPER_KEY:
        return jsonify({"error": "YouTube API key is not configured."}), 500

    data = request.get_json(silent=True) or {}
    youtube_link = data.get("youtubeLink", "")
    video_id = extract_video_id(youtube_link)

    if video_id:
        video_details = get_video_details(video_id)
        if not video_details:
            return jsonify({"error": "Error: Could not retrieve video details."}), 500

        comments = get_comments(video_id)

        if comments:
            analyzed_comments = analyze_comments(comments)

            return jsonify({
                "video_details": video_details,
                "analyzed_comments": analyzed_comments,
            })

        return jsonify({"error": "Error: Could not retrieve comments from video."}), 500

    return jsonify({"error": "Invalid YouTube link provided."}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
