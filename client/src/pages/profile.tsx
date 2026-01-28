import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Smartphone, MessageCircle, Settings, Edit, Facebook, Twitter, Instagram, Mail, CheckCircle, XCircle, LogOut, AlertCircle } from "lucide-react";
import { messagesData } from "@/lib/data";
import type { SettingsState } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGmailStatus, connectGmail, disconnectGmail } from "@/store/slices/gmailSlice";

export default function Profile() {
  const [settings, setSettings] = useState<SettingsState>({
    emailOnFollow: true,
    emailOnReply: false,
    emailOnMention: true,
    newLaunches: false,
    monthlyUpdates: true,
    newsletter: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { connected: gmailConnected, account, loading, error: gmailError } = useAppSelector((state) => state.gmail);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchGmailStatus());
  }, [dispatch]);

  useEffect(() => {
    if (gmailError) {
      setShowErrorDialog(true);
    }
  }, [gmailError]);

  const handleConnectGmail = async () => {
    const result = await dispatch(connectGmail());
    if (connectGmail.fulfilled.match(result)) {
      window.location.href = result.payload;
    }
  };

  const handleDisconnectClick = () => {
    setShowDisconnectConfirm(true);
  };

  const handleDisconnectGmail = async () => {
    setShowDisconnectConfirm(false);
    await dispatch(disconnectGmail());
  };

  const handleSettingChange = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Use real user data
  const userProfile = {
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'User',
    title: "Pharma Tech User",
    firstName: user?.first_name || user?.username || '',
    email: user?.email || '',
    username: user?.username || '',
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-primary rounded-xl p-8 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-16 h-16 border-2 border-white/20">
                  <AvatarFallback className="bg-secondary text-white">
                    {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                  <p className="text-white/80">{userProfile.title}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 hover:text-white border-0">
                  <Smartphone className="mr-2 w-4 h-4" />
                  App
                </Button>
                <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 hover:text-white border-0">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Message
                </Button>
                <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 hover:text-white border-0">
                  <Settings className="mr-2 w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gmail Configuration */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Gmail Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gmailConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Connected</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Email:</strong> {account?.email}</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Emails are being synced automatically
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    New emails will appear in the Emails section. They are stored in our database for faster access.
                  </p>
                  <Button
                    onClick={handleDisconnectClick}
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {loading ? "Disconnecting..." : "Disconnect Gmail"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Not Connected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect your Gmail account to start monitoring emails. We only request read-only access.
                  </p>
                  <Button
                    onClick={handleConnectGmail}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Connecting..." : "Connect Gmail Account"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to Google to grant permissions. We only fetch emails after you connect.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-normal text-foreground mb-3">ACCOUNT</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Email me when someone follows me</span>
                    <Switch 
                      checked={settings.emailOnFollow}
                      onCheckedChange={() => handleSettingChange('emailOnFollow')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Email me when someone answers on my post</span>
                    <Switch 
                      checked={settings.emailOnReply}
                      onCheckedChange={() => handleSettingChange('emailOnReply')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Email me when someone mentions me</span>
                    <Switch 
                      checked={settings.emailOnMention}
                      onCheckedChange={() => handleSettingChange('emailOnMention')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-normal text-foreground mb-3">APPLICATION</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">New launches and projects</span>
                    <Switch 
                      checked={settings.newLaunches}
                      onCheckedChange={() => handleSettingChange('newLaunches')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Monthly product updates</span>
                    <Switch 
                      checked={settings.monthlyUpdates}
                      onCheckedChange={() => handleSettingChange('monthlyUpdates')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Subscribe to newsletter</span>
                    <Switch 
                      checked={settings.newsletter}
                      onCheckedChange={() => handleSettingChange('newsletter')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Profile Information</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-normal text-foreground">Username:</label>
                  <p className="text-sm text-muted-foreground mt-1">{userProfile.username}</p>
                </div>
                <div>
                  <label className="text-sm font-normal text-foreground">First Name:</label>
                  <p className="text-sm text-muted-foreground mt-1">{userProfile.firstName || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-normal text-foreground">Email:</label>
                  <p className="text-sm text-muted-foreground mt-1">{userProfile.email || 'Not set'}</p>
                </div>
                {account?.email && (
                  <div>
                    <label className="text-sm font-normal text-foreground">Gmail:</label>
                    <p className="text-sm text-muted-foreground mt-1">{account.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gmailConnected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Check the Emails section to view your synced emails</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Connect Gmail to start syncing emails</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg font-semibold">
              Disconnect Gmail Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-2">
              Are you sure you want to disconnect your Gmail account? Email syncing will stop and you won't receive new emails automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDisconnectConfirm(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleDisconnectGmail()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Error
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {gmailError || 'An error occurred'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
