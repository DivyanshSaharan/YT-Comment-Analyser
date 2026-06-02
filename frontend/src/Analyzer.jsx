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

const DEFAULT_COMMENT_COUNT = 100;
const MAX_COMMENT_COUNT = 1000;
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

const Analyzer = ({ onScoreChange }) => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [commentCount, setCommentCount] = useState(DEFAULT_COMMENT_COUNT);
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
  const availableCommentCount = Number(
    result?.available_comment_count || result?.video_details?.comment_count || 0,
  );
  const maxCommentCount = availableCommentCount
    ? Math.min(availableCommentCount, MAX_COMMENT_COUNT)
    : MAX_COMMENT_COUNT;

  const handleCommentCountChange = (event) => {
    const nextValue = Number(event.target.value);
    if (!Number.isFinite(nextValue)) return;
    setCommentCount(Math.min(Math.max(Math.floor(nextValue), 1), maxCommentCount));
  };

  const handleAnalyzeClick = async () => {
    if (!youtubeLink.trim()) {
      setError("Enter a YouTube video URL before running analysis.");
      return;
    }

    const safeCommentCount = Math.min(Math.max(Number(commentCount) || 1, 1), maxCommentCount);
    setCommentCount(safeCommentCount);
    setIsLoading(true);
    setError("");
    setResult(null);
    onScoreChange?.(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        youtubeLink: youtubeLink.trim(),
        commentCount: safeCommentCount,
      });
      const nextScore = calculateOverallScore(response.data.analyzed_comments || []);
      setResult(response.data);
      setCommentCount(response.data.requested_comment_count || safeCommentCount);
      onScoreChange?.(nextScore);
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
                <TextField
                  label="Comments"
                  type="number"
                  value={commentCount}
                  onChange={handleCommentCountChange}
                  inputProps={{ min: 1, max: maxCommentCount, step: 1 }}
                  helperText={
                    availableCommentCount
                      ? `Max ${formatNumber(maxCommentCount)}`
                      : `1-${formatNumber(MAX_COMMENT_COUNT)}`
                  }
                  sx={{ width: { xs: "100%", sm: 132 }, flexShrink: 0 }}
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
                    <AnimatedScoreMeter key={result.video_details.video_title} score={overallScore} />
                    <Grid container spacing={2}>
                      <Metric icon={<VisibilityIcon />} label="Views" value={formatNumber(result.video_details.view_count)} />
                      <Metric icon={<ThumbUpAltIcon />} label="Likes" value={formatNumber(result.video_details.like_count)} />
                      <Metric
                        icon={<PlayCircleIcon />}
                        label="Comments analyzed"
                        value={`${formatNumber(totalComments)} / ${formatNumber(availableCommentCount || totalComments)}`}
                      />
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
                <SentimentMeter groups={groupedComments} total={totalComments} />
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

const AnimatedScoreMeter = ({ score }) => {
  const safeScore = Math.min(Math.max(Number(score) || 0, 0), 10);
  const targetAngle = safeScore * 18;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f4f8f6",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" },
          gap: 2.5,
          alignItems: "center",
        }}
      >
        <Box sx={{ position: "relative", maxWidth: 240, mx: "auto", width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              height: 118,
              overflow: "hidden",
              borderTopLeftRadius: 999,
              borderTopRightRadius: 999,
              background:
                "conic-gradient(from 270deg at 50% 100%, #d0443e 0deg, #d49b16 76deg, #0f8f63 180deg, transparent 180deg)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: "20px 20px 0",
                borderTopLeftRadius: 999,
                borderTopRightRadius: 999,
                backgroundColor: "#f4f8f6",
              }}
            />
            <Box
              sx={{
                "@keyframes scoreNeedleSettle": {
                  "0%": { transform: "translateX(-100%) rotate(0deg)" },
                  "30%": { transform: "translateX(-100%) rotate(176deg)" },
                  "48%": { transform: "translateX(-100%) rotate(34deg)" },
                  "66%": { transform: "translateX(-100%) rotate(132deg)" },
                  "82%": { transform: `translateX(-100%) rotate(${targetAngle - 8}deg)` },
                  "100%": { transform: `translateX(-100%) rotate(${targetAngle}deg)` },
                },
                position: "absolute",
                left: "50%",
                bottom: 0,
                width: "42%",
                height: 4,
                transformOrigin: "100% 50%",
                borderRadius: 999,
                backgroundColor: "#17201c",
                animation: "scoreNeedleSettle 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                bottom: -9,
                width: 24,
                height: 24,
                transform: "translateX(-50%)",
                borderRadius: "50%",
                backgroundColor: "#17201c",
                border: "5px solid #f4f8f6",
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 0.75,
              color: "#66766f",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 800 }}>
            Overall sentiment score
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: 0, lineHeight: 1 }}>
            {safeScore.toFixed(1)}
            <Typography component="span" sx={{ color: "#66766f", fontWeight: 900, ml: 0.5 }}>
              / 10
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ color: "#52635b", mt: 0.75 }}>
            Weighted by comment sentiment, recency, and engagement.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const SentimentMeter = ({ groups, total }) => {
  const segments = Object.entries(groups).map(([sentiment, comments]) => {
    const count = comments.length;
    return {
      sentiment,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
      ...sentimentConfig[sentiment],
    };
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        height: "100%",
        border: "1px solid rgba(23, 32, 28, 0.10)",
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 850, letterSpacing: 0 }}>
              Sentiment breakdown
            </Typography>
            <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 700 }}>
              {formatNumber(total)} comments analyzed
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            100%
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: 18,
            overflow: "hidden",
            borderRadius: 999,
            backgroundColor: "#eef4f1",
          }}
        >
          {segments.map((segment) => (
            <Box
              key={segment.sentiment}
              sx={{
                width: `${segment.percent}%`,
                minWidth: segment.count ? 10 : 0,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </Box>

        <Stack spacing={1}>
          {segments.map((segment) => (
            <Box
              key={segment.sentiment}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 1.5,
                alignItems: "center",
                py: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: segment.color,
                }}
              />
              <Typography sx={{ fontWeight: 800 }}>{segment.label}</Typography>
              <Typography sx={{ color: "#52635b", fontWeight: 800 }}>
                {segment.count} ({segment.percent}%)
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default Analyzer;
