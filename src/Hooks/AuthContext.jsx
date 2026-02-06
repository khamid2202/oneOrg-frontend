import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../Library/RequestMaker";
import { endpoints } from "../Library/Endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Derived role helpers
  const roles = useMemo(() => {
    return user?.user?.roles || user?.roles || [];
  }, [user]);

  const isAdmin = useMemo(() => roles.includes("admin"), [roles]);
  const isTeacher = useMemo(() => roles.includes("teacher"), [roles]);

  const username = useMemo(() => {
    return user?.user?.username || user?.username || "";
  }, [user]);

  // Fetch and verify user from API
  const fetchUser = useCallback(async (skipCheck = false) => {
    // Check if user has ever logged in (avoid unnecessary API calls)
    const hasSession = localStorage.getItem("hasSession");
    if (!skipCheck && !hasSession) {
      setUser(null);
      setAuthLoading(false);
      return false;
    }

    try {
      // First validate the token
      const validateRes = await api.get(endpoints.VALIDATE);
      if (!validateRes.data?.ok) {
        setUser(null);
        localStorage.removeItem("hasSession");
        setAuthLoading(false);
        return false;
      }

      // Then fetch user data
      const userRes = await api.get(endpoints.USER);
      if (userRes.data) {
        setUser(userRes.data);
        setAuthError(null);
        setAuthLoading(false);
        return true;
      } else {
        setUser(null);
        setAuthLoading(false);
        return false;
      }
    } catch (err) {
      // Don't log error for expected 400/401 responses (user not authenticated)
      if (err?.response?.status !== 400 && err?.response?.status !== 401) {
        console.error("Auth verification failed:", err);
      }
      setUser(null);
      localStorage.removeItem("hasSession");
      setAuthError(null); // Don't set error for unauthenticated users
      setAuthLoading(false);
      return false;
    }
  }, []);

  // Verify auth on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      // Call the revoke endpoint to invalidate the cookie on the server
      await api.post(endpoints.REVOKE, {});
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // Clear user state immediately
    setUser(null);

    // Clear any localStorage data
    localStorage.clear();

    // Force reload to ensure all state is cleared and cookie is gone
    window.location.href = "/login";
  }, []);

  // Called after successful login to refresh user data
  const onLoginSuccess = useCallback(async () => {
    setAuthLoading(true);
    localStorage.setItem("hasSession", "true");
    return fetchUser(true); // skipCheck=true since we just logged in
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      username,
      roles,
      isAdmin,
      isTeacher,
      isAuthenticated: !!user,
      authLoading,
      authError,
      logout,
      onLoginSuccess,
      refetchUser: fetchUser,
    }),
    [
      user,
      username,
      roles,
      isAdmin,
      isTeacher,
      authLoading,
      authError,
      logout,
      onLoginSuccess,
      fetchUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
