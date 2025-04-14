from model import predict_sentiment_f

def analyze_comments(comments):
    results = []
    for comment in comments:
        sentiment, rating = predict_sentiment_f(comment["comment"])
        results.append({
            "comment": str(comment["comment"]),
            "num_of_likes": float(comment["num_of_likes"]),  # ensure native float
            "timestamp": str(comment["timestamp"]),
            "sentiment": str(sentiment),
            "rating": float(rating)  # ensure native float
        })
    return results
