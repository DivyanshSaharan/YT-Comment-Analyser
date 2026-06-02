import { Box } from "@mui/material";
import { useState } from "react";
import Analyzer from "./Analyzer";
import Banner from "./Banner";
import Footer from "./Footer";
import Navbar from "./Navbar";

function App() {
  const [latestScore, setLatestScore] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle");

  const isComplete = analysisStatus === "analyzed";

  return (
    <Box
      sx={{
        height: isComplete ? "auto" : "100vh",
        minHeight: "100vh",
        maxHeight: isComplete ? "none" : "100vh",
        overflow: isComplete ? "auto" : "hidden",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #f7faf9 0%, #eef4f1 44%, #ffffff 100%)",
        color: "#17201c",
      }}
    >
      <Navbar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: isComplete ? "flex-start" : "center",
          gap: isComplete ? 0 : { xs: 1.5, md: 2.5 },
          overflow: isComplete ? "visible" : "hidden",
        }}
      >
        <Banner score={latestScore} status={analysisStatus} />
        <Analyzer
          status={analysisStatus}
          onAnalysisStatusChange={setAnalysisStatus}
          onScoreChange={setLatestScore}
        />
      </Box>
      {isComplete && <Footer />}
    </Box>
  );
}

export default App;
