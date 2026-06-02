import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import logo from "./assets/banner.jpg";

const Banner = () => {
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
          <Box
            component="img"
            src={logo}
            alt="Creator dashboard preview"
            sx={{
              width: "100%",
              minHeight: { xs: 260, md: 440 },
              objectFit: "cover",
              borderRadius: 2,
              boxShadow: "0 28px 70px rgba(17, 106, 88, 0.20)",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Banner;
