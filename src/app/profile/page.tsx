"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, updateProfile, getUserGoals, logout, changePassword, User, Goal } from "@/lib/api";
import Link from "next/link";
import { Edit2, Check, X, LogOut, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editPrefix, setEditPrefix] = useState("");
  const [usernameSuffix, setUsernameSuffix] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socials, setSocials] = useState<{ platform: string, url: string }[]>([]);

  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setUser(session);
    
    // Extract prefix and suffix
    const lastHyphenIndex = session.username.lastIndexOf('-');
    if (lastHyphenIndex !== -1) {
      setEditPrefix(session.username.substring(0, lastHyphenIndex));
      setUsernameSuffix(session.username.substring(lastHyphenIndex));
    } else {
      setEditPrefix(session.username);
      setUsernameSuffix(`-${Math.random().toString(36).slice(2, 8)}`); // 6 letters alphanumerics
    }

    setHeadline(session.headline || "");
    setBio(session.bio || "");
    setSkills(session.skills || "");
    setDescription(session.description || "");
    setAvatarUrl(session.avatarUrl || "");
    setSocials(session.socials || []);

    getUserGoals().then(fetchedGoals => {
      setGoals(fetchedGoals);
      setLoading(false);
    });
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSocial = () => {
    setSocials([...socials, { platform: "Website", url: "" }]);
  };

  const handleSocialChange = (index: number, field: "platform" | "url", value: string) => {
    const newSocials = [...socials];
    newSocials[index][field] = value;
    setSocials(newSocials);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editPrefix.trim()) return;
    
    setError("");
    setIsUpdating(true);
    try {
      const updatedUser = await updateProfile({
        usernamePrefix: editPrefix,
        headline,
        bio,
        skills,
        description,
        avatarUrl,
        socials
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isChangingPasswordFormOpen, setIsChangingPasswordFormOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length <= 6) {
      setPasswordError("Password must be more than 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangingPasswordFormOpen(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.message || "Failed to change password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) {
      const lastHyphenIndex = user.username.lastIndexOf('-');
      if (lastHyphenIndex !== -1) {
        setEditPrefix(user.username.substring(0, lastHyphenIndex));
      } else {
        setEditPrefix(user.username);
      }
      setHeadline(user.headline || "");
      setBio(user.bio || "");
      setSkills(user.skills || "");
      setDescription(user.description || "");
    }
    setError("");
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12 mt-8">
      <header className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Your Profile</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <div className="bg-background border border-border p-6 rounded-xl shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Profile Details</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 px-4 py-2 rounded-md transition-colors">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
        
        {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-md">{error}</div>}
        
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Profile Picture</label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Username Prefix (Free Tier)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isUpdating}
                  placeholder="e.g. cool-coder"
                  required
                />
                <span className="text-muted-foreground font-mono bg-muted p-2 rounded-md border border-border">{usernameSuffix}</span>
              </div>
              <p className="text-xs text-muted-foreground">You can only change the prefix. Upgrade to premium to customize the full username.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Headline</label>
              <input 
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isUpdating}
                placeholder="e.g. Software Engineer | Lifelong Learner"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Bio</label>
              <input 
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isUpdating}
                placeholder="A short tagline about yourself."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Skills</label>
              <input 
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isUpdating}
                placeholder="e.g. React, Node.js, System Design"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Description (Interests, Plans, Mission)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
                disabled={isUpdating}
                placeholder="Write about what drives you, what you plan to learn, and your mission."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Social Links</label>
              {socials.map((social, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select 
                    value={social.platform} 
                    onChange={(e) => handleSocialChange(idx, "platform", e.target.value)}
                    className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent w-1/3"
                    disabled={isUpdating}
                  >
                    <option value="Website">Website</option>
                    <option value="Twitter">X / Twitter</option>
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Dribbble">Dribbble</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                  <input 
                    type="url"
                    value={social.url}
                    onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent flex-1"
                    disabled={isUpdating}
                  />
                  <button type="button" onClick={() => handleRemoveSocial(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors" disabled={isUpdating}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddSocial} 
                disabled={isUpdating}
                className="self-start text-sm font-medium text-primary hover:underline mt-1"
              >
                + Add Social Link
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button type="submit" disabled={isUpdating || !editPrefix.trim()} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                <Check className="w-4 h-4" /> Save
              </button>
              <button type="button" onClick={cancelEdit} disabled={isUpdating} className="flex items-center gap-2 px-6 py-2 bg-muted text-foreground font-medium rounded-md hover:bg-border disabled:opacity-50 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-20 h-20 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">@{user?.username}</span>
                {user?.headline && <span className="text-sm text-muted-foreground">{user.headline}</span>}
              </div>
            </div>
            {user?.bio && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Bio</h4>
                <p className="text-foreground">{user.bio}</p>
              </div>
            )}
            {user?.skills && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Skills</h4>
                <p className="text-foreground">{user.skills}</p>
              </div>
            )}
            {user?.description && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">About Me</h4>
                <p className="text-foreground whitespace-pre-wrap">{user.description}</p>
              </div>
            )}
            {user?.socials && user.socials.length > 0 && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Social Links</h4>
                <div className="flex flex-wrap gap-2">
                  {user.socials.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-muted text-sm font-medium text-foreground hover:bg-border rounded-md border border-border transition-colors">
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-background border border-border p-6 rounded-xl shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Change Password</h3>
          {!isChangingPasswordFormOpen && (
            <button 
              onClick={() => setIsChangingPasswordFormOpen(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:opacity-90 transition-opacity text-sm border border-border"
            >
              Change Password
            </button>
          )}
        </div>
        
        {passwordSuccess && <div className="text-green-600 text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-md">{passwordSuccess}</div>}
        {passwordError && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-md">{passwordError}</div>}
        
        {isChangingPasswordFormOpen && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Current Password</label>
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                  disabled={isUpdatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button type="submit" disabled={isUpdatingPassword || !oldPassword || !newPassword || !confirmNewPassword} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-colors">
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
              <button type="button" onClick={() => setIsChangingPasswordFormOpen(false)} disabled={isUpdatingPassword} className="flex items-center gap-2 px-6 py-2 bg-muted text-foreground font-medium rounded-md hover:bg-border disabled:opacity-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-foreground">Your Goals</h3>
        {goals.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
            You haven't created any goals yet. <Link href="/" className="text-accent hover:underline">Create one now.</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map(goal => (
              <div key={goal.id} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground">🔥 {goal.currentStreak} Day Streak</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/track/${goal.slug}`} className="px-4 py-2 bg-muted text-foreground font-medium rounded-md hover:bg-border transition-colors text-sm">
                    Dashboard
                  </Link>
                  <Link href={`/${user?.username}/${goal.slug}`} className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity text-sm hidden sm:block">
                    View Public
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
