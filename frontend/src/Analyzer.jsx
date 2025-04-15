import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import CustomPieChart from './PieChart';
import axios from 'axios';
import Comment from './Comment';

const Analyzer = () => {
    const [youtubeLink, setYoutubeLink] = useState('');
    const [result, setResult] = useState(null);
    const [overallScore, setOverallScore] = useState(0.0);

    const handleAnalyzeClick = () => {
        console.log('YouTube Link:', youtubeLink);

        axios.post('http://127.0.0.1:5000/analyze', { youtubeLink: youtubeLink })
            .then(response => {
                console.log(response)
                setTimeout(() => {
                    console.log(result)
                    calOverAllScore(result);
                }, 4000);
                
                setResult(response.data);
                console.log(result)
                calOverAllScore(result);
            })
            .catch(error => {
                console.error("Error analyzing the YouTube link: ", error);
            });
    };

    const calOverAllScore = (result) => {
        console.log("Calculating Overall Score...");

        const comments = result.analyzed_comments;
        const DECAY_RATE = 1; // Temporal decay rate (lambda)
        const BASE_SCORE = 1;
        const currentDate = new Date(); // Current date for age calculation
        console.log("Size:", comments.length);

        let totalWeightedScore = 0.0;
        let totalWeight = 0.0;

        for (const commentObj of comments) {
            const likes = Number(commentObj.likes) || 0;
            const rating = Number(commentObj.rating) || 0;
            const publishedAt = new Date(commentObj.timestamp);
            console.log(commentObj.publishedAt)

            // Calculate comment age in days
            const commentAge = Math.max((currentDate - publishedAt) / (1000 * 60 * 60 * 24), 1);

            // Calculate weights
            const likesWeight = likes + 1;
            const recencyWeight = Math.exp(-DECAY_RATE * commentAge);
            const overallWeight = likesWeight * recencyWeight;

            // Accumulate weighted score and total weights
            totalWeightedScore += rating * overallWeight;
            totalWeight += overallWeight;
        }

        if (totalWeight === 0) {
            console.error("No comments to calculate score.");
            setOverallScore(0);
            return;
        }

        // Calculate the weighted average
        const weightedAverage = totalWeightedScore / totalWeight;

        // Map weighted average from [-1, 1] to [0, 10]
        const overallScore = Math.min(Math.max(BASE_SCORE + 5 * (weightedAverage + 1), 0), 10); // Transformation formula

        // Log results
        console.log("Total Weight:", totalWeight);
        console.log("Total Weighted Score:", totalWeightedScore);
        console.log("Weighted Average:", weightedAverage);
        console.log("OVERALL SCORE (0-10):", overallScore);

        // Set the final score
        setOverallScore(overallScore);
    };


    const groupCommentsBySentiment = (comments) => {
        const positive = comments.filter(comment => comment.sentiment === "positive");
        const neutral = comments.filter(comment => comment.sentiment === "neutral");
        const negative = comments.filter(comment => comment.sentiment === "negative");

        return { positive, neutral, negative };
    };

    const groupedComments = result ? groupCommentsBySentiment(result.analyzed_comments) : null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // padding: '20px',
                // backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                margin: '50px auto',
            }}
        >
            <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                Please enter a YouTube video link below:
            </Typography>
            <TextField
                label="Enter YouTube Link"
                variant="outlined"
                fullWidth
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                sx={{ marginBottom: '20px', maxWidth: '500px' }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyzeClick}
            >
                Analyze
            </Button>
            {result && (
                <>
                    {/* { <h1>Display YouTube Video Details </h1> } */}
                    <Box sx={{
                        textAlign: 'center',
                        my: 4,
                        p: 3,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 2,
                        boxShadow: 3,
                        maxWidth: '600px',
                        mx: 'auto'
                    }}>
                        <img
                            src={result.video_details.thumbnail_url}
                            alt="Video Thumbnail"
                            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', marginBottom: '20px' }}
                        />
                        <Typography variant="h6" gutterBottom>Video Title: {result.video_details.video_title}</Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>Channel: {result.video_details.channel_name}</Typography>
                        <Typography variant="body1" gutterBottom>Views: {result.video_details.view_count}</Typography>
                        <Typography variant="body1">Likes: {result.video_details.like_count}</Typography>

                    </Box>

                    <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
                        <Typography variant="h6">Overall Sentiment Score: {overallScore}</Typography>
                        {/* <Typography variant="body2">Based on {likes} likes</Typography> */}
                    </Box>

                    <div style={{ width: '100%' }}>

                        <CustomPieChart data={groupedComments} />
                    </div>

                    <Grid container spacing={4} sx={{ marginTop: '20px', maxWidth: '1000px' }}>
                        <Grid item xs={4}>
                            <Typography variant="h6" sx={{ marginBottom: '10px', textAlign: 'left', marginLeft: '10px' }}>
                                Positive Comments
                            </Typography>
                            {groupedComments.positive.map((row, index) => (
                                <Comment key={index} comment={row.comment} likes={row.num_of_likes} sentiment={row.sentiment} timestamp={row.timestamp} rating={row.rating} />
                            ))}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="h6" sx={{ marginBottom: '10px', textAlign: 'left', marginLeft: '10px' }}>
                                Neutral Comments
                            </Typography>
                            {groupedComments.neutral.map((row, index) => (
                                <Comment key={index} comment={row.comment} likes={row.num_of_likes} sentiment={row.sentiment} timestamp={row.timestamp} rating={row.rating} />
                            ))}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="h6" sx={{ marginBottom: '10px', textAlign: 'left', marginLeft: '10px' }}>
                                Negative Comments
                            </Typography>
                            {groupedComments.negative.map((row, index) => (
                                <Comment key={index} comment={row.comment} likes={row.num_of_likes} sentiment={row.sentiment} timestamp={row.timestamp} rating={row.rating} />
                            ))}
                        </Grid>
                    </Grid>
                </>
            )
            }
            {/* {result && (
                result.analyzed_comments.map((row, index) => (
                    <Comment key={index} comment={row.comment} likes={row.num_of_likes} sentiment={row.sentiment} />
                    // <p key={index}>{row.comment}</p>
                ))
            )} */}

        </Box>
    );
};

export default Analyzer;
