import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import logo from './assets/banner.jpg';
const Banner = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        backgroundColor: "#f4f4f4",
        borderRadius: "8px",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Roboto, sans-serif", 
              fontWeight: "bold",
              marginBottom:"20px"
            }}
          >
            Discover True Sentiment with VibeCheck
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Unlock the true sentiment behind YouTube comments to empower
            creators with actionable insights for better content and viewer
            engagement.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} textAlign="right" >
          <img
            src={logo}
            alt="VibeCheck Banner"
            style={{ maxWidth: "90%", height: "auto", borderRadius: "8px"}}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Banner;
