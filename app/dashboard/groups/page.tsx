"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dummyGroups = [
	{ id: "grp1", name: "Grup A", description: "Kelompok belajar A" },
	{ id: "grp2", name: "Grup B", description: "Kelompok belajar B" },
	{ id: "grp3", name: "Grup C", description: "Kelompok diskusi C" },
];

export default function GroupsPage() {
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [securityCode, setSecurityCode] = useState("");
	const [role, setRole] = useState("anggota");
	const [showModal, setShowModal] = useState(false);
	const router = useRouter();

	const handleSelectGroup = (groupId: string) => {
		setSelectedGroup(groupId);
		setShowModal(true);
	};

	const handleJoin = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedGroup && securityCode) {
			if (role === "anggota") {
				router.push(`/dashboard/groups/${selectedGroup}/detect`);
			} else {
				router.push(`/dashboard/groups/${selectedGroup}/leader`);
			}
		}
	};

	return (
		<div className="max-w-3xl mx-auto mt-10">
			<h1 className="text-2xl font-bold mb-6">Daftar Grup</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{dummyGroups.map((g) => (
					<Card key={g.id} className="p-6 flex flex-col justify-between">
						<div>
							<h2 className="text-xl font-semibold mb-2">{g.name}</h2>
							<p className="text-gray-600 mb-4">{g.description}</p>
						</div>
						<Button
							onClick={() => handleSelectGroup(g.id)}
							className="mt-auto w-full"
						>
							Masuk Grup
						</Button>
					</Card>
				))}
			</div>
			{/* Modal kode keamanan */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
						<button
							type="button"
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
							onClick={() => {
								setShowModal(false);
								setSecurityCode("");
							}}
							aria-label="Tutup"
						>
							×
						</button>
						<h2 className="text-lg font-bold mb-2">
							Masukkan Kode Keamanan
						</h2>
						<form onSubmit={handleJoin} className="space-y-4">
							<div>
								<label className="block mb-1 font-medium">
									Kode Keamanan
								</label>
								<input
									className="w-full border rounded p-2"
									type="password"
									placeholder="Kode Keamanan"
									value={securityCode}
									onChange={(e) =>
										setSecurityCode(e.target.value)
									}
									required
								/>
							</div>
							<div>
								<label className="block mb-1 font-medium">
									Masuk Sebagai
								</label>
								<select
									className="w-full border rounded p-2"
									value={role}
									onChange={(e) => setRole(e.target.value)}
								>
									<option value="anggota">Anggota</option>
									<option value="ketua">Ketua</option>
								</select>
							</div>
							<Button type="submit" className="w-full">
								Masuk
							</Button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
