import { useEffect, useState } from "react";
import { getGroupMembers } from "@/service/groupMembers";

export function useUserGroups(userId: string | null, groups: any[]) {
  const [userGroups, setUserGroups] = useState<any[]>([]);
  useEffect(() => {
    if (!userId || !groups.length) return;
    let isMounted = true;
    Promise.all(
      groups.map(async (g) => {
        try {
          const res = await getGroupMembers(g.id);
          if (res.data && Array.isArray(res.data.members)) {
            if (res.data.members.includes(userId)) {
              return g;
            }
          }
        } catch {}
        return null;
      })
    ).then((results) => {
      if (isMounted) setUserGroups(results.filter(Boolean));
    });
    return () => {
      isMounted = false;
    };
  }, [userId, groups]);
  return userGroups;
}
