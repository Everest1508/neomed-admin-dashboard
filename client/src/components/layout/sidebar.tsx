import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Table, 
  Bell,
  CreditCard,
  BookOpen,
  LogIn, 
  UserPlus,
  X,
  Mail,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Emails",
    href: "/emails",
    icon: Mail,
  },
  {
    title: "Tables",
    href: "/tables",
    icon: Table,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
];

const authItems = [
  {
    title: "Sign In",
    href: "/auth/sign-in",
    icon: LogIn,
  },
  {
    title: "Sign Up",
    href: "/auth/sign-up",
    icon: UserPlus,
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout(token));
    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <aside className="w-60 bg-card lg:bg-transparent flex flex-col relative z-10 h-full border-r border-border lg:border-0">
      {/* Brand Header */}
      <div className="p-6 pb-0 relative z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Pharma Tech
        </h1>
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                  isActive
                    ? "px-3 py-2 shadow-sm hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                    : "px-3 py-2 text-foreground hover:bg-muted transition-colors duration-200 border border-transparent"
                )}
              >
                <Icon className="mr-3 w-4 h-4" />
                {item.title}
              </div>
            </NavLink>
          );
        })}

        {/* User Info & Logout */}
        {isAuthenticated && (
          <div className="pt-4 border-t border-border mt-4">
            <div className="px-4 mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                ACCOUNT
              </p>
              <div className="text-sm text-foreground mb-2">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center text-sm font-normal rounded-lg cursor-pointer px-3 py-2 text-foreground hover:bg-muted transition-colors duration-200 border border-transparent"
            >
              <LogOut className="mr-3 w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {/* Auth Section - Only show when not authenticated */}
        {!isAuthenticated && (
          <div className="pt-4 border-t border-border mt-4">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              AUTH PAGES
            </p>
            {authItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink key={item.href} to={item.href}>
                  <div
                    className={cn(
                      "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                      isActive
                        ? "px-3 py-2 shadow-sm hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                        : "px-3 py-2 text-foreground hover:bg-muted transition-colors duration-200 border border-transparent"
                    )}
                  >
                    <Icon className="mr-3 w-4 h-4" />
                    {item.title}
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Documentation Link */}
        <div className="mt-auto pt-4 border-t border-border">
          <NavLink to="/documentation">
            <div
              className={cn(
                "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                location.pathname === "/documentation"
                  ? "px-3 py-2 shadow-sm hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                  : "px-3 py-2 text-foreground hover:bg-muted transition-colors duration-200"
              )}
            >
              <BookOpen className="mr-3 w-4 h-4" />
              Documentation
            </div>
          </NavLink>
        </div>
      </nav>

    </aside>
  );
}
