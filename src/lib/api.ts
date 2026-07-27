import api from "./axios";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  username: string; // The generated username e.g. 'john-a8x9f2'
  bio?: string;
  headline?: string;
  skills?: string;
  description?: string;
  avatarUrl?: string;
  socials?: SocialLink[];
  accessToken?: string;
}

export interface Goal {
  id: string;
  userId: string;
  slug: string;
  title: string;
  description?: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  username?: string;
  avatarUrl?: string;
  socials?: SocialLink[];
}

export interface LogEntry {
  id: string;
  goalId: string;
  content: string;
  createdAt: string;
}

const mapId = <T extends Record<string, any>>(obj: T): any => {
  if (!obj) return obj;
  const { _id, ...rest } = obj;
  return { ...rest, id: _id };
};

// -----------------------------------------------------
// AUTHENTICATION
// -----------------------------------------------------

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export async function register(
  email: string,
  password: string,
  baseUsername: string,
): Promise<User> {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const username = `${baseUsername.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

  const res = await api.post("/auth/register", { email, password, username });
  return mapId(res.data.data);
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post("/auth/login", { email, password });
  const user = mapId(res.data.data);
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
  return user;
}

export async function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

export async function updateProfile(data: {
  usernamePrefix?: string;
  bio?: string;
  headline?: string;
  skills?: string;
  description?: string;
  avatarUrl?: string;
  socials?: SocialLink[];
}): Promise<User> {
  const user = getSession();
  if (!user) throw new Error("Unauthorized");

  let newUsername = user.username;
  if (data.usernamePrefix) {
    const currentUsername = user.username;
    const lastHyphenIndex = currentUsername.lastIndexOf("-");
    const suffix =
      lastHyphenIndex !== -1
        ? currentUsername.substring(lastHyphenIndex)
        : `-${Math.random().toString(36).slice(2, 8)}`;
    newUsername =
      data.usernamePrefix.toLowerCase().replace(/[^a-z0-9]+/g, "-") + suffix;
  }

  const updateData = {
    ...data,
    username: newUsername,
  };

  const res = await api.patch(`/users/${user.id}`, updateData);
  const updatedUser = mapId(res.data.data);

  // keep token
  updatedUser.accessToken = user.accessToken;
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  return updatedUser;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const user = getSession();
  if (!user) throw new Error("Unauthorized");

  const res = await api.post("/auth/change-password", {
    oldPassword,
    newPassword,
    user: {
      ...user,
      _id: user.id,
    },
  });

  if (res.data.data) {
    const updatedUser = mapId(res.data.data);
    updatedUser.accessToken = res.data.data.accessToken || user.accessToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }
}

export async function requestOTP(email: string): Promise<void> {
  const res = await api.post("/auth/forgot-password", { email });
  if (typeof window !== "undefined") {
    localStorage.setItem("reset_token", res.data.refreshToken);
  }
}

export async function verifyOTP(email: string, code: string): Promise<string> {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("reset_token") || "";
  }
  await api.post("/auth/verify-otp", {
    refreshToken: token,
    otp: parseInt(code, 10),
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("reset_otp_code", code);
  }
  return token;
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  let otp = "";
  if (typeof window !== "undefined") {
    otp = localStorage.getItem("reset_otp_code") || "";
  }
  await api.post("/auth/reset-password", {
    refreshToken: token,
    otp: parseInt(otp, 10),
    password: newPassword,
  });
  if (typeof window !== "undefined") {
    localStorage.removeItem("reset_token");
    localStorage.removeItem("reset_otp_code");
  }
}

// -----------------------------------------------------
// GOALS
// -----------------------------------------------------

export async function createGoal(title: string): Promise<Goal> {
  const user = getSession();
  if (!user) throw new Error("Unauthorized");

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const res = await api.post("/goals", {
    userId: user.id,
    slug,
    title,
    currentStreak: 0,
    longestStreak: 0,
  });
  return mapId(res.data.data);
}

export async function getUserGoals(): Promise<Goal[]> {
  const res = await api.get("/goals");
  return res.data.data.map(mapId);
}

export async function getGoalBySlug(
  slug: string,
  username?: string,
): Promise<Goal | null> {
  try {
    if (username) {
      const res = await api.get(`/goals/public/${username}/${slug}`);
      const goal = mapId(res.data.data);
      const profileRes = await api.get(`/users/public/${username}`);
      const owner = profileRes.data.data;
      return {
        ...goal,
        username: owner.username,
        avatarUrl: owner.avatarUrl,
        socials: owner.socialLinks || owner.socials,
      };
    } else {
      const goals = await getUserGoals();
      const goal = goals.find((g: Goal) => g.slug === slug);
      if (!goal) return null;
      const user = getSession();
      if (user) {
        return {
          ...goal,
          username: user.username,
          avatarUrl: user.avatarUrl,
          socials: user.socials,
        };
      }
      return goal;
    }
  } catch (e) {
    return null;
  }
}

export async function updateGoal(
  slug: string,
  newTitle: string,
): Promise<Goal> {
  const goals = await getUserGoals();
  const goal = goals.find((g: Goal) => g.slug === slug);
  if (!goal) throw new Error("Goal not found");

  const res = await api.patch(`/goals/${goal.id}`, { title: newTitle });
  return mapId(res.data.data);
}

export async function deleteGoal(slug: string): Promise<void> {
  const goals = await getUserGoals();
  const goal = goals.find((g: Goal) => g.slug === slug);
  if (!goal) throw new Error("Goal not found");

  await api.delete(`/goals/${goal.id}`);
}

export async function addLog(
  goalId: string,
  content: string,
): Promise<LogEntry> {
  // Check if log exists for today
  const logs = await getLogsForGoal(goalId);
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
  const existingLog = logs.find((l: LogEntry) => {
    const d = new Date(l.createdAt);
    const logDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return logDate === today;
  });

  if (existingLog) {
    const res = await api.patch(`/log-entries/${existingLog.id}`, {
      content,
    });
    return mapId(res.data.data);
  } else {
    const res = await api.post("/log-entries", { goalId, content });
    return mapId(res.data.data);
  }
}

export async function getLogsForGoal(goalId: string): Promise<LogEntry[]> {
  const res = await api.get(`/log-entries?goalId=${goalId}`);
  return res.data.data
    .map(mapId)
    .sort(
      (a: LogEntry, b: LogEntry) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
