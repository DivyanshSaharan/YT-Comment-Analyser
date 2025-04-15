import os
import re
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import nltk

# Download VADER lexicon
nltk.download('vader_lexicon')

# Load environment variables
load_dotenv()
DEVELOPER_KEY = os.getenv('DEVELOPER_KEY')

# Flask setup
app = Flask(__name__)
CORS(app)

# VADER Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

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

def analyze_comments(comments):
    for comment in comments:
        text = comment['comment']
        scores = analyzer.polarity_scores(text)
        comment['sentiment'] = (
            'positive' if scores['compound'] >= 0.05 else
            'negative' if scores['compound'] <= -0.05 else
            'neutral'
        )
        comment['compound_score'] = scores['compound']
    return comments

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

            analyzed_comments = analyze_comments(df.to_dict(orient='records'))

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
