import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import Comment from "./Comment";
import CustomPieChart from "./PieChart";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const sentimentConfig = {
  positive: { label: "Positive", color: "#0f8f63", background: "#e2f5ed" },
  neutral: { label: "Neutral", color: "#7a5a12", background: "#fff3cf" },
  negative: { label: "Negative", color: "#b42318", background: "#fde7e5" },
};

const emptyGroups = { positive: [], neutral: [], negative: [] };

const formatNumber = (value) =>
  value === undefined || value === null
    ? "Unavailable"
    : new Intl.NumberFormat("en-US").format(Number(value));

const calculateOverallScore = (comments) => {
  const currentDate = new Date();
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const comment of comments) {
    const likes = Number(comment.num_of_likes) || 0;
    const rating = Number(comment.rating) || 0;
    const publishedAt = new Date(comment.timestamp);
    const commentAge = Math.max((currentDate - publishedAt) / 86400000, 1);
    const recencyWeight = Math.exp(-0.03 * commentAge);
    const weight = (likes + 1) * recencyWeight;

    totalWeightedScore += rating * weight;
    totalWeight += weight;
  }

  if (!totalWeight) return 0;

  const weightedAverage = totalWeightedScore / totalWeight;
  return Math.min(Math.max(1 + 5 * (weightedAverage + 1), 0), 10);
};

const Analyzer = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const groupedComments = useMemo(() => {
    if (!result?.analyzed_comments) return emptyGroups;

    return result.analyzed_comments.reduce(
      (groups, comment) => {
        const sentiment = comment.sentiment?.toLowerCase();
        if (groups[sentiment]) groups[sentiment].push(comment);
        return groups;
      },
      { positive: [], neutral: [], negative: [] },
    );
  }, [result]);

  const overallScore = useMemo(
    () => calculateOverallScore(result?.analyzed_comments || []),
    [result],
  );

  const totalComments = result?.analyzed_comments?.length || 0;

  const handleAnalyzeClick = async () => {
    if (!youtubeLink.trim()) {
      setError("Enter a YouTube video URL before running analysis.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        youtubeLink: youtubeLink.trim(),
      });
      setResult(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Analysis failed. Check the backend server and YouTube API key.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="main" id="analyzer" sx={{ pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            border: "1px solid rgba(23, 32, 28, 0.10)",
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.92)",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={1}>
                <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: 0 }}>
                  Run comment analysis
                </Typography>
                <Typography sx={{ color: "#5b6b63", maxWidth: 680 }}>
                  Paste a public YouTube video URL to fetch metadata, classify
                  comments, and compute a recency-and-engagement weighted score.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="YouTube video URL"
                  variant="outlined"
                  fullWidth
                  value={youtubeLink}
                  onChange={(event) => setYoutubeLink(event.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAnalyzeClick}
                  disabled={isLoading}
                  startIcon={
                    isLoading ? <CircularProgress color="inherit" size={18} /> : <PlayCircleIcon />
                  }
                  sx={{
                    minWidth: 130,
                    borderRadius: 2,
                    backgroundColor: "#116a58",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#0b5748" },
                  }}
                >
                  Analyze
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {result && (
          <Stack spacing={3.5} sx={{ mt: 4 }}>
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid rgba(23, 32, 28, 0.10)",
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <Grid container>
                <Grid item xs={12} md={5}>
                  <Box
                    component="img"
                    src={result.video_details.thumbnail_url}
                    alt={result.video_details.video_title}
                    sx={{ width: "100%", height: "100%", minHeight: 280, objectFit: "cover" }}
                  />
                </Grid>
                <Grid item xs={12} md={7}>
                  <Stack spacing={2.5} sx={{ p: { xs: 2.5, md: 4 } }}>
                    <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: 0 }}>
                      {result.video_details.video_title}
                    </Typography>
                    <Typography sx={{ color: "#5b6b63", fontWeight: 700 }}>
                      {result.video_details.channel_name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Metric icon={<QueryStatsIcon />} label="Overall score" value={`${overallScore.toFixed(1)} / 10`} />
                      <Metric icon={<VisibilityIcon />} label="Views" value={formatNumber(result.video_details.view_count)} />
                      <Metric icon={<ThumbUpAltIcon />} label="Likes" value={formatNumber(result.video_details.like_count)} />
                      <Metric icon={<PlayCircleIcon />} label="Comments analyzed" value={formatNumber(totalComments)} />
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <CustomPieChart data={groupedComments} />
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "1px solid rgba(23, 32, 28, 0.10)",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 850, letterSpacing: 0 }}>
                    Sentiment breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(groupedComments).map(([sentiment, comments]) => (
                      <Grid item xs={12} sm={4} key={sentiment}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: sentimentConfig[sentiment].background,
                            color: sentimentConfig[sentiment].color,
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 900 }}>
                            {comments.length}
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>
                            {sentimentConfig[sentiment].label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {Object.entries(groupedComments).map(([sentiment, comments]) => (
                <Grid item xs={12} md={4} key={sentiment}>
                  <Stack spacing={1.5}>
                    <Chip
                      label={`${sentimentConfig[sentiment].label} comments`}
                      sx={{
                        alignSelf: "flex-start",
                        backgroundColor: sentimentConfig[sentiment].background,
                        color: sentimentConfig[sentiment].color,
                        fontWeight: 800,
                      }}
                    />
                    {comments.slice(0, 12).map((row) => (
                      <Comment key={`${row.timestamp}-${row.comment}`} {...row} />
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

const Metric = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6}>
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f4f8f6",
      }}
    >
      <Box sx={{ color: "#116a58", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

export default Analyzer;
