import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

interface EmotionTrendLineChartProps {
  recent: Array<{ timestamp: string; dominant: string }>;
}

const emotionLabels = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];
const emotionMap: Record<string, number> = {
  happy: 0, sad: 1, angry: 2, fearful: 3, disgusted: 4, surprised: 5, neutral: 6
};

export function EmotionTrendLineChart({ recent }: EmotionTrendLineChartProps) {
  if (!Array.isArray(recent) || recent.length === 0) return <p className="text-muted-foreground">No trend data</p>;
  const validRecent = recent.filter(r => r && typeof r.dominant === "string" && typeof r.timestamp === "string");
  const data = {
    labels: validRecent.map((r) => new Date(r.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Dominant Emotion",
        data: validRecent.map((r) => emotionMap[r.dominant] ?? 6),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        fill: false,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const idx = context.parsed.y;
            return `Emotion: ${emotionLabels[idx]}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            if (typeof value === "number") return emotionLabels[value] || value;
            return value;
          },
        },
      },
    },
  };
  return <Line data={data} options={options} />;
}
