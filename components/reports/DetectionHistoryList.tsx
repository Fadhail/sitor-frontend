import { getEmotionColor, formatDate } from "@/lib/utils";

interface EmotionRecord {
  timestamp: string;
  emotion: string;
  probability: number;
}

interface DetectionHistoryListProps {
  emotionHistory: EmotionRecord[];
}

export function DetectionHistoryList({ emotionHistory }: DetectionHistoryListProps) {
  if (emotionHistory.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No detection history available</p>
        <p className="text-sm mt-2">Start detecting emotions to build your history</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {[...emotionHistory]
        .reverse()
        .slice(0, 10)
        .map((record, index) => (
          <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
            <div className={`w-3 h-3 rounded-full ${getEmotionColor(record.emotion)}`} />
            <div className="flex-1">
              <p className="font-medium capitalize">{record.emotion}</p>
              <p className="text-sm text-muted-foreground">{formatDate(record.timestamp)}</p>
            </div>
            <div className="text-sm font-medium">{Math.round(record.probability * 100)}%</div>
          </div>
        ))}
    </div>
  );
}
