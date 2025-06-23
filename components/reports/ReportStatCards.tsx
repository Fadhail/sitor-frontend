import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmotionColor, formatDate } from "@/lib/utils";

interface EmotionRecord {
  timestamp: string;
  emotion: string;
  probability: number;
}

interface ReportStatCardsProps {
  emotionHistory: EmotionRecord[];
  dominant: string;
}

export function ReportStatCards({ emotionHistory, dominant }: ReportStatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Sesi</CardTitle>
          <CardDescription>Jumlah sesi deteksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{emotionHistory.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Emosi Dominan</CardTitle>
          <CardDescription>Paling sering terdeteksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${getEmotionColor(dominant)}`} />
            <span className="text-2xl font-bold capitalize">{dominant}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Deteksi Terakhir</CardTitle>
          <CardDescription>Sesi terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {emotionHistory.length > 0 ? (
            <div>
              <div className="text-xl font-bold capitalize">{emotionHistory[emotionHistory.length - 1].emotion}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(emotionHistory[emotionHistory.length - 1].timestamp)}
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold">Tidak Ada Data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
