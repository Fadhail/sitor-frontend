import { SmilePlus } from "lucide-react";
import { format } from "date-fns";

interface RecentActivityProps {
  activities: Array<{ timestamp: string; dominant: string }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return <div className="text-muted-foreground">Tidak ada aktivitas terkini</div>;
  }
  return (
    <div className="space-y-4">
      {activities.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            <SmilePlus className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Sesi Deteksi Emosi</p>
            <p className="text-sm text-muted-foreground">{format(new Date(item.timestamp), "PPpp")}</p>
          </div>
          <div className="ml-auto font-medium capitalize">{item.dominant}</div>
        </div>
      ))}
    </div>
  );
}
