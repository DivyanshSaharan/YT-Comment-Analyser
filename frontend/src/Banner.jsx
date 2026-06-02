import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

const Banner = ({ score }) => {
  return (
    <Box component="section" sx={{ py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 4, md: 7 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3} alignItems="flex-start">
            <Chip
              icon={<InsightsIcon />}
              label="Local TensorFlow sentiment + sarcasm models"
              sx={{
                backgroundColor: "#e0f2ed",
                color: "#0c5a4a",
                fontWeight: 700,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                maxWidth: 680,
                fontSize: { xs: "2.6rem", md: "4.25rem" },
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: 0.95,
              }}
            >
              YouTube comment sentiment, ranked by impact.
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 620, color: "#52635b", lineHeight: 1.7 }}
            >
              VibeCheck pulls real video feedback, scores each comment with your
              trained models, and turns noisy engagement into a creator-ready
              sentiment dashboard.
            </Typography>
            <Button
              href="#analyzer"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#116a58",
                borderRadius: 2,
                px: 3,
                py: 1.3,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { backgroundColor: "#0b5748" },
              }}
            >
              Analyze a video
            </Button>
          </Stack>
          <HeroMeter score={score} />
        </Box>
      </Container>
    </Box>
  );
};

const HeroMeter = ({ score }) => {
  const hasScore = Number.isFinite(score);
  const safeScore = hasScore ? Math.min(Math.max(Number(score), 0), 10) : 0;
  const targetAngle = safeScore * 18;

  return (
    <Box
      aria-label="Sentiment meter"
      sx={{
        p: { xs: 2.5, md: 3 },
        border: "1px solid rgba(23, 32, 28, 0.10)",
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        boxShadow: "0 28px 70px rgba(17, 106, 88, 0.18)",
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0 }}>
              Sentiment meter
            </Typography>
            <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 700 }}>
              Starts at zero and settles on the final score.
            </Typography>
          </Box>
          <Chip
            label={hasScore ? "Analyzed" : "Awaiting URL"}
            size="small"
            sx={{
              backgroundColor: hasScore ? "#e0f2ed" : "#eef4f1",
              color: hasScore ? "#0c5a4a" : "#52635b",
              fontWeight: 800,
            }}
          />
        </Box>

        <Box
          key={hasScore ? safeScore.toFixed(2) : "empty"}
          sx={{ position: "relative", width: "100%", maxWidth: 420, mx: "auto", pt: 2 }}
        >
          <Box
            sx={{
              position: "relative",
              height: { xs: 138, sm: 170 },
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
                inset: "24px 24px 0",
                borderTopLeftRadius: 999,
                borderTopRightRadius: 999,
                backgroundColor: "#fff",
              }}
            />
            <Box
              sx={{
                "@keyframes heroNeedleSettle": {
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
                transform: `translateX(-100%) rotate(${hasScore ? targetAngle : 0}deg)`,
                transformOrigin: "100% 50%",
                borderRadius: 999,
                backgroundColor: "#17201c",
                animation: hasScore
                  ? "heroNeedleSettle 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards"
                  : "none",
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
                border: "5px solid #fff",
              }}
            />
          </Box>
          <Box sx={{ mt: 1.5, textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: 0 }}>
              {safeScore.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#66766f", fontWeight: 800 }}>
              {hasScore ? "final score" : "ready to calculate"}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Banner;
