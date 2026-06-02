import { Box } from "@mui/material";
import Analyzer from "./Analyzer";
import Banner from "./Banner";
import Footer from "./Footer";
import Navbar from "./Navbar";

function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7faf9 0%, #eef4f1 44%, #ffffff 100%)",
        color: "#17201c",
      }}
    >
      <Navbar/>
      <Banner/>
      <Analyzer/>
      <Footer/>
    </Box>
  );
}

export default App;
