import { getEmotionColor } from "@/lib/utils";

interface EmotionBarChartProps {
  emotionHistory: { emotion: string }[];
  counts: Record<string, number>;
}

export function EmotionBarChart({ emotionHistory, counts }: EmotionBarChartProps) {
  const emotions = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];
  return (
    <div className="h-[300px] flex items-end justify-around gap-2 pt-10 pb-4">
      {emotions.map((emotion) => {
        const count = counts[emotion] || 0;
        const percentage = emotionHistory.length > 0 ? Math.round((count / emotionHistory.length) * 100) : 0;
        const height = `${Math.max(percentage, 5)}%`;
        return (
          <div key={emotion} className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium">{percentage}%</div>
            <div className={`w-12 ${getEmotionColor(emotion)} rounded-t-md`} style={{ height }}></div>
            <div className="text-xs capitalize">{emotion}</div>
          </div>
        );
      })}
    </div>
  );
}
