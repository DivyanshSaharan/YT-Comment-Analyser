import { StrictMode } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const theme = createTheme({
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: 0,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          letterSpacing: 0,
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
