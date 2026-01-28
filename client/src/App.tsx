import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeConfigurator } from "@/components/theme-configurator";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { ProtectedRoute, AuthInitializer } from "@/components/auth";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Emails from "@/pages/emails";
import Tables from "@/pages/tables";
import Notifications from "@/pages/notifications";
import Subscriptions from "@/pages/subscriptions";
import Documentation from "@/pages/documentation";
import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import GmailCallback from "@/pages/gmail/callback";
import NotFound from "@/pages/not-found";

function Layout({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeConfigOpen, setThemeConfigOpen] = useState(false);

  return (
    <div className="flex h-screen bg-stone-50 grain-texture">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-10
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* Top Header with Search Bar */}
        <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Header />
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6">
          <Card className="flex-1 border border-border bg-card relative z-20">
          {title && (
            <div className="pt-6 px-3 lg:px-6 pb-4">
              <h1 className="text-xl font-semibold text-foreground mb-1">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              <div className="border-b border-border mt-4"></div>
            </div>
          )}
            {children}
          </Card>
          <Footer />
        </div>
      </main>
      
      {/* Theme Configurator Modal - Outside sidebar for proper z-index */}
      <ThemeConfigurator 
        isOpen={themeConfigOpen} 
        onClose={() => setThemeConfigOpen(false)} 
      />
    </div>
  );
}

function Router() {
  return (
    <Routes>
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/sign-up" element={<SignUp />} />
      <Route path="/gmail/callback" element={
        <ProtectedRoute>
          <GmailCallback />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout title="Profile" description="Manage your account settings and personal information">
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/emails" element={
        <ProtectedRoute>
          <Layout title="Emails" description="View and manage your Gmail emails">
            <Emails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tables" element={
        <ProtectedRoute>
          <Layout title="Tables" description="Browse and manage data across different views">
            <Tables />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout title="Notifications" description="Stay updated with your latest alerts and messages">
            <Notifications />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute>
          <Layout title="Subscriptions" description="Manage your billing, plans, and subscription settings">
            <Subscriptions />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documentation" element={
        <ProtectedRoute>
          <Layout title="Documentation" description="Installation guide, component examples, and project information">
            <Documentation />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Component to handle non-hash OAuth callback route
function OAuthCallbackHandler() {
  useEffect(() => {
    // Check if we're on the /gmail/callback path (without hash)
    if (window.location.pathname === '/gmail/callback') {
      // Preserve query parameters when redirecting to hash route
      const search = window.location.search;
      console.log('OAuthCallbackHandler: Moving params to hash', search);
      // Redirect to hash route with query params preserved
      window.location.hash = `#/gmail/callback${search}`;
      // Don't clean pathname immediately - let the callback component extract params first
      // The callback component will clean it after extracting params
    }
  }, []);
  
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <AuthInitializer />
            <OAuthCallbackHandler />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </HashRouter>
    </Provider>
  );
}

export default App;
