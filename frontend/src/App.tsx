import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { apiFetch, clearSessionToken, getSessionToken } from "@/lib/api";
import { Icons } from "@/lib/icons";
import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";
import Dashboard from "@/screens/Dashboard";
import Books from "@/screens/Books";
import BookForm from "@/screens/BookForm";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The app's menu, drawn around every screen except the ones routed outside it below.
function AppShellLayout() {
  const navigate = useNavigate();
  const onDashboard = useLocation().pathname === "/dashboard";
  const signOut = async () => {
    try {
      await apiFetch("/auth/signout", { method: "POST" });
    } catch {
      // Signing out locally must work whatever the server says.
    }
    clearSessionToken();
    navigate("/sign-in");
  };
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="flex items-center gap-6 px-6 py-2">
          <p
            className="shrink-0 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"Book Lending"}
          </p>
          <nav aria-label="App menu" className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <Icons.Home size={16} />
              {"Dashboard"}
            </NavLink>
            <NavLink to="/books" className={navLinkClass}>
              <Icons.Search size={16} />
              {"Books"}
            </NavLink>
          </nav>
          {!onDashboard && (
            <button
              type="button"
              onClick={signOut}
              className="ml-auto text-sm font-medium"
              style={{ color: "var(--brand-fg-muted)" }}
            >
              {"Sign out"}
            </button>
          )}
        </div>
      </header>
      <main
        className="flex-1 overflow-auto"
        onClickCapture={(e) => {
          // A screen's own Sign out button must really end the session.
          const btn = (e.target as HTMLElement).closest("button");
          if (btn && /sign out/i.test(btn.textContent ?? "")) {
            e.stopPropagation();
            e.preventDefault();
            void signOut();
          }
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function RequireAuth() {
  return getSessionToken() ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<AppShellLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/book-form" element={<BookForm />} />
          <Route path="/book-form/:id" element={<BookForm />} />
        </Route>
      </Route>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
