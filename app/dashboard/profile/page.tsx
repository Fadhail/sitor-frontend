"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getMe, updateProfile, updatePassword } from "@/service/api"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { PasswordForm } from "@/components/profile/PasswordForm"

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string, email: string } | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setProfileError("Not authenticated")
          return
        }
        const res = await getMe(token)
        setUser(res.data.user)
        setName(res.data.user?.name || "")
        setEmail(res.data.user?.email || "")
      } catch (err: any) {
        setProfileError("Failed to fetch user data")
      }
    }
    fetchUser()
  }, [])

  const handleProfileChange = (field: "name" | "email", value: string) => {
    if (field === "name") setName(value)
    if (field === "email") setEmail(value)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess("")
    try {
      await updateProfile({ name, email })
      setUser((prev) => prev ? { ...prev, name, email } : { name, email })
      setProfileSuccess("Profile updated successfully")
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => {
    if (field === "currentPassword") setCurrentPassword(value)
    if (field === "newPassword") setNewPassword(value)
    if (field === "confirmPassword") setConfirmPassword(value)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      setPasswordLoading(false)
      return
    }
    try {
      await updatePassword({ oldPassword: currentPassword, newPassword })
      setPasswordSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Pengaturan Akun</h1>
        <p className="text-muted-foreground text-base">Kelola pengaturan dan preferensi akun Anda</p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="password">Ubah Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm
            name={name}
            email={email}
            isLoading={profileLoading}
            error={profileError}
            success={profileSuccess}
            onChange={handleProfileChange}
            onSubmit={handleProfileUpdate}
          />
        </TabsContent>
        <TabsContent value="password">
          <PasswordForm
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            isLoading={passwordLoading}
            error={passwordError}
            success={passwordSuccess}
            onChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
