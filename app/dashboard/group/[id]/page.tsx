export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Detail Grup</h1>
      <p className="mb-4">ID Grup: {params.id}</p>
      <p>Halaman detail grup ini bisa dikembangkan untuk menampilkan anggota, status emosi, dan fitur lain sesuai kebutuhan.</p>
    </div>
  )
}
