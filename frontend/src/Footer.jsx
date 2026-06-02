import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        borderTop: "1px solid rgba(23, 32, 28, 0.10)",
        backgroundColor: "#17201c",
        color: "#dbe7e2",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2">
          VibeCheck pairs the YouTube Data API with local TensorFlow sentiment
          and sarcasm models for creator feedback analysis.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
