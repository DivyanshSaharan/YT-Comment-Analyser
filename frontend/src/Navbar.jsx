import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Navbar = () => {
  return (
    <Box sx={{ height: 60 }}>
      <AppBar
        component="nav"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(23, 32, 28, 0.08)',
          color: '#17201c',
        }}
      >
        <Toolbar sx={{ minHeight: 60, px: { xs: 2, md: 5 } }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 0 }}
          >
            VibeCheck
          </Typography>
          <Typography variant="body2" sx={{ color: '#5b6b63', fontWeight: 600 }}>
            YouTube sentiment intelligence
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
