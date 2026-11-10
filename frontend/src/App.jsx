import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api, AuthContext, TOKEN_KEY, useAuth, homeFor } from "./api";
import Nav from "./nav";
import Report from "./report";
import Res from "./result";
import Admin from "./admin";
import Log from "./login";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem(TOKEN_KEY),
  );

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const signIn = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes(user.role))
    return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="splash">Loading…</div>;

  return (
    <>
      {user && <Nav />}
      <Routes>
        <Route
          path="/auth"
          element={
            user ? <Navigate to={homeFor(user.role)} replace /> : <Log />
          }
        />

        <Route
          path="/result"
          element={
            <Guard roles={["student", "teacher", "admin"]}>
              <Report />
            </Guard>
          }
        />

        <Route
          path="/add"
          element={
            <Guard roles={["teacher", "admin"]}>
              <Res />
            </Guard>
          }
        />

        <Route
          path="/admin"
          element={
            <Guard roles={["admin"]}>
              <Admin />
            </Guard>
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={user ? homeFor(user.role) : "/auth"} replace />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
