"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getGroups, joinGroup } from "@/service/api";
import { useUserGroups } from "./useUserGroups";
import { getGroupMembers } from "@/service/groupMembers";

export default function GroupsPage() {
	const [groups, setGroups] = useState<any[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [securityCode, setSecurityCode] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const user =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("user") || "null")
			: null;

	useEffect(() => {
		getGroups()
			.then((res) => {
				console.log("[DEBUG] getGroups response:", res.data);
				setGroups(res.data.groups || []);
			})
			.catch((err) => {
				console.error("[DEBUG] getGroups error:", err);
				setGroups([]);
			});
	}, []);

	const handleSelectGroup = (groupId: string) => {
		setSelectedGroup(groupId);
		setShowModal(true);
		setError("");
	};

	const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		joinGroup({ groupId: selectedGroup!, securityCode })
			.then((res) => {
				setIsLoading(false);
				setShowModal(false);
				setSecurityCode("");
				router.push(`/dashboard/groups/${selectedGroup}/detect`);
			})
			.catch((err) => {
				setIsLoading(false);
				if (err.response?.status === 400) {
					setError("Kode keamanan salah. Silakan coba lagi.");
				} else {
					setError("Terjadi kesalahan. Silakan coba lagi nanti.");
				}
			});
	};

	return (
		<div className="max-w-3xl mx-auto mt-10">
			<h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
				Daftar Grup
				<Button
					className="ml-4"
					onClick={() => router.push("/dashboard/groups/create")}
				>
					+ Tambah Grup
				</Button>
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{groups
					.slice()
					.sort((a, b) => {
						const aJoined = a.members.includes(user?.id);
						const bJoined = b.members.includes(user?.id);
						if (aJoined && !bJoined) return -1;
						if (!aJoined && bJoined) return 1;
						return 0;
					})
					.map((g) => (
						<Card
							key={g.id}
							className={`p-6 flex flex-col justify-between ${
								g.members.includes(user?.id) ? "border-2 border-green-500" : ""
							}`}
						>
							<div>
								<h2 className="text-xl font-semibold mb-2">{g.name}</h2>
								<p className="text-gray-600 mb-4">{g.description}</p>
							</div>
							{g.members.includes(user?.id) ? (
								<Button
									onClick={() => {
										if (user?.id === g.leaderId) {
											router.push(`/dashboard/groups/${g.id}/leader`);
										} else {
											router.push(`/dashboard/groups/${g.id}/detect`);
										}
									}}
									className="mt-auto w-full bg-green-500 hover:bg-green-600"
								>
									Akses Grup
								</Button>
							) : (
								<Button
									onClick={() => handleSelectGroup(g.id)}
									className="mt-auto w-full"
								>
									Masuk Grup
								</Button>
							)}
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
								setError("");
							}}
							aria-label="Tutup"
						>
							×
						</button>
						<h2 className="text-lg font-bold mb-2">
							Masukkan Kode Keamanan
						</h2>
						<form onSubmit={handleJoin} className="space-y-4">
							{error && (
								<div className="text-red-600 text-sm">{error}</div>
							)}
							<div>
								<label className="block mb-1 font-medium">
									Kode Keamanan
								</label>
								<input
									className="w-full border rounded p-2"
									type="password"
									placeholder="Kode Keamanan"
									value={securityCode}
									onChange={(e) => setSecurityCode(e.target.value)}
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? "Memproses..." : "Masuk"}
							</Button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
