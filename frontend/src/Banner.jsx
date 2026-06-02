import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

const Banner = ({ score, status }) => {
  return (
    <Box component="section" sx={{ py: { xs: 2.5, md: 3 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="flex-start">
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
                fontSize: { xs: "2.15rem", md: "3.35rem" },
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: 1,
              }}
            >
              YouTube comment sentiment, ranked by impact.
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 620, color: "#52635b", lineHeight: 1.45 }}
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
          <HeroMeter score={score} status={status} />
        </Box>
      </Container>
    </Box>
  );
};

const HeroMeter = ({ score, status }) => {
  const hasScore = status === "analyzed" && Number.isFinite(score);
  const isAnalyzing = status === "analyzing";
  const safeScore = hasScore ? Math.min(Math.max(Number(score), 0), 10) : 0;
  const targetAngle = safeScore * 18;
  const chipConfig = {
    analyzed: { label: "Analyzed", background: "#e0f2ed", color: "#0c5a4a" },
    analyzing: { label: "Analyzing", background: "#fff3cf", color: "#7a5a12" },
    idle: { label: "Awaiting URL", background: "#eef4f1", color: "#52635b" },
  }[status] || { label: "Awaiting URL", background: "#eef4f1", color: "#52635b" };

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
      <Stack spacing={2}>
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
            label={chipConfig.label}
            size="small"
            sx={{
              backgroundColor: chipConfig.background,
              color: chipConfig.color,
              fontWeight: 800,
            }}
          />
        </Box>

        <Box
          key={hasScore ? safeScore.toFixed(2) : status}
          sx={{ position: "relative", width: "100%", maxWidth: 420, mx: "auto", pt: 2 }}
        >
          <Box
            sx={{
              position: "relative",
              height: { xs: 122, sm: 150 },
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
                  "82%": { transform: `translateX(-100%) rotate(${Math.max(targetAngle - 8, 0)}deg)` },
                  "100%": { transform: `translateX(-100%) rotate(${targetAngle}deg)` },
                },
                "@keyframes heroNeedleScan": {
                  "0%": { transform: "translateX(-100%) rotate(0deg)" },
                  "50%": { transform: "translateX(-100%) rotate(180deg)" },
                  "100%": { transform: "translateX(-100%) rotate(0deg)" },
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
                  : isAnalyzing
                    ? "heroNeedleScan 1.25s ease-in-out infinite"
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
              {hasScore ? "final score" : isAnalyzing ? "calculating" : "ready to calculate"}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Banner;
