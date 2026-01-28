import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { ChartsShowcase } from "@/components/dashboard/charts-showcase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Activity, Users, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { fetchEmails } from "@/store/slices/emailsSlice";
import { fetchGmailStatus } from "@/store/slices/gmailSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { emails } = useAppSelector((state) => state.emails);
  const { connected: gmailConnected } = useAppSelector((state) => state.gmail);

  useEffect(() => {
    dispatch(fetchEmails(false));
    dispatch(fetchGmailStatus());
  }, [dispatch]);

  const stats = {
    totalEmails: emails.length,
    unreadEmails: emails.filter((e) => !e.is_read).length,
    gmailConnected,
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      {/* Welcome Section */}
      {/* <Card className="relative mb-8 border-border bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.first_name || user?.username || 'User'}!
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Manage your Gmail emails and stay connected with your pharmaceutical communications.
              </p>
              <div className="flex gap-4">
                {stats.gmailConnected ? (
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Mail className="mr-2 w-5 h-5" />
                    View Emails
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <Mail className="mr-2 w-5 h-5" />
                    Connect Gmail
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                <Activity className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Emails</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalEmails}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unread Emails</p>
                <p className="text-3xl font-bold text-foreground">{stats.unreadEmails}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gmail Status</p>
                <p className="text-lg font-semibold text-foreground">
                  {stats.gmailConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.gmailConnected ? 'bg-success/10' : 'bg-muted'
              }`}>
                {stats.gmailConnected ? (
                  <TrendingUp className="w-6 h-6 text-success" />
                ) : (
                  <Users className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StatsGrid />
      <ProjectsTable />
      <ChartsShowcase />
    </div>
  );
}
