import Link from "next/link"
import { Button } from "@/components/ui/button"

// Dummy data for group list (replace with real data from backend later)
const groups = [
  {
    id: "1",
    name: "Kelompok A",
    leader: "Budi Santoso",
    members: 5,
    isJoined: false,
  },
  {
    id: "2",
    name: "Kelompok B",
    leader: "Siti Aminah",
    members: 8,
    isJoined: true,
  },
  {
    id: "3",
    name: "Kelompok C",
    leader: "Andi Wijaya",
    members: 3,
    isJoined: false,
  },
]

export default function GroupListPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Daftar Grup</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="rounded-lg border bg-background p-6 shadow">
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <p className="text-sm text-muted-foreground mb-1">Leader: {group.leader}</p>
            <p className="text-sm text-muted-foreground mb-4">Anggota: {group.members}</p>
            {group.isJoined ? (
              <Link href={`/dashboard/group/${group.id}`}>
                <Button className="w-full" variant="default">Masuk Grup</Button>
              </Link>
            ) : (
              <Button className="w-full" variant="secondary" disabled>Menunggu Persetujuan</Button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/dashboard/group/create">
          <Button variant="outline">Buat Grup Baru</Button>
        </Link>
      </div>
    </div>
  )
}
