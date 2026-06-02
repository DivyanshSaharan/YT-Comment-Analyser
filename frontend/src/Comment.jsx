import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

const sentimentStyles = {
  positive: { color: "#0f8f63", background: "#e2f5ed" },
  neutral: { color: "#7a5a12", background: "#fff3cf" },
  negative: { color: "#b42318", background: "#fde7e5" },
};

const Comment = ({ comment, num_of_likes, sentiment, timestamp, rating }) => {
  const style = sentimentStyles[sentiment] || sentimentStyles.neutral;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid rgba(23, 32, 28, 0.10)",
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Chip
            label={sentiment}
            size="small"
            sx={{
              backgroundColor: style.background,
              color: style.color,
              fontWeight: 800,
              textTransform: "capitalize",
            }}
          />
          <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 700 }}>
            {Number(rating).toFixed(2)}
          </Typography>
        </Box>
        <Typography sx={{ color: "#24312c", lineHeight: 1.55 }}>{comment}</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            color: "#66766f",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ThumbUpAltOutlinedIcon fontSize="small" />
            <Typography variant="body2">{Number(num_of_likes || 0).toLocaleString()}</Typography>
          </Box>
          <Typography variant="body2">
            {new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default Comment;
