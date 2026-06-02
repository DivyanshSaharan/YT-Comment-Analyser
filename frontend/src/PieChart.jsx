import { Box, Paper, Typography } from "@mui/material";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0f8f63", "#d49b16", "#d0443e"];

const CustomPieChart = ({ data }) => {
  const chartData = [
    { name: "Positive", value: data.positive.length },
    { name: "Neutral", value: data.neutral.length },
    { name: "Negative", value: data.negative.length },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        border: "1px solid rgba(23, 32, 28, 0.10)",
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 850, letterSpacing: 0 }}>
        Sentiment distribution
      </Typography>
      <Box sx={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={115}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CustomPieChart;
