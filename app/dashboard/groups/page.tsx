"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getGroups, joinGroup, createGroup, deleteGroup, leaveGroup } from "@/service/api";
import { GroupList } from "@/components/groups/GroupList";
import { JoinGroupModal } from "@/components/groups/JoinGroupModal";
import { AddGroupModal } from "@/components/groups/AddGroupModal";

export default function GroupsPage() {
	const [groups, setGroups] = useState<any[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [securityCode, setSecurityCode] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [addError, setAddError] = useState("");
	const [addLoading, setAddLoading] = useState(false);
	const router = useRouter();

	const user =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("user") || "null")
			: null;
	const userId = user?.id || "";

	useEffect(() => {
		getGroups()
			.then((res) => {
				setGroups(res.data.groups || []);
			})
			.catch(() => {
				setGroups([]);
			});
	}, []);

	const handleJoin = (groupId: string) => {
		setSelectedGroup(groupId);
		setShowModal(true);
		setError("");
	};

	const handleAccess = (groupId: string, isLeader: boolean) => {
		if (isLeader) {
			router.push(`/dashboard/groups/${groupId}/leader`);
		} else {
			router.push(`/dashboard/groups/${groupId}/detect`);
		}
	};

	const handleJoinSubmit = (code: string) => {
		if (!selectedGroup) return;
		setIsLoading(true);
		setError("");
		joinGroup({ groupId: selectedGroup, securityCode: code })
			.then(() => {
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

	const handleAddGroup = () => {
		setShowAddModal(true);
		setAddError("");
	};

	// Perbaiki error pada handler di page agar mengirim securityCode
	const handleAddGroupSubmit = async (data: { name: string; description: string; securityCode: string }) => {
		setAddLoading(true);
		setAddError("");
		try {
			await createGroup(data);
			setShowAddModal(false);
			setAddLoading(false);
			// Refresh group list
			getGroups().then((res) => setGroups(res.data.groups || []));
		} catch (err: any) {
			setAddError(err?.response?.data?.message || "Gagal membuat grup");
			setAddLoading(false);
		}
	};

	// Handler hapus grup
	const handleDeleteGroup = async (groupId: string) => {
		try {
			await deleteGroup(groupId);
			getGroups().then((res) => setGroups(res.data.groups || []));
		} catch {}
	};

	// Handler keluar grup
	const handleLeaveGroup = async (groupId: string) => {
		try {
			await leaveGroup(groupId);
			getGroups().then((res) => setGroups(res.data.groups || []));
		} catch {}
	};

	return (
		// Hilangkan container agar sticky search bar bekerja di area scroll
		<div className="max-w-6xl mx-auto px-4 py-10">
			<GroupList
				groups={groups}
				userId={userId}
				onJoin={handleJoin}
				onAccess={handleAccess}
				onAddGroup={handleAddGroup}
				onDeleteGroup={handleDeleteGroup}
				onLeaveGroup={handleLeaveGroup}
			/>
			<JoinGroupModal
				open={showModal}
				onClose={() => {
					setShowModal(false);
					setSecurityCode("");
					setError("");
				}}
				onSubmit={handleJoinSubmit}
				isLoading={isLoading}
				error={error}
				securityCode={securityCode}
				setSecurityCode={setSecurityCode}
			/>
			<AddGroupModal
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSubmit={handleAddGroupSubmit}
				isLoading={addLoading}
				error={addError}
			/>
		</div>
	);
}
