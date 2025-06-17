import { PieChart } from "lucide-react";

interface EmotionPieChartProps {
  dominant: string;
}

export function EmotionPieChart({ dominant }: EmotionPieChartProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 flex items-center justify-center">
          <PieChart className="w-full h-full text-muted-foreground" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-medium">Dominant</div>
            <div className="text-xl font-bold capitalize">{dominant}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
