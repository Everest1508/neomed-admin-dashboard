import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Star, 
  StarOff,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchEmails, toggleStar, markAsRead, syncRecentEmails, Email } from "@/store/slices/emailsSlice";

export default function Emails() {
  const dispatch = useAppDispatch();
  const { emails, loading, syncing, error } = useAppSelector((state) => state.emails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchEmails(false));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const handleToggleStar = async (email: Email) => {
    await dispatch(toggleStar(email.id));
  };

  const handleMarkAsRead = async (email: Email) => {
    await dispatch(markAsRead({ emailId: email.id, isRead: !email.is_read }));
  };

  const handleSyncRecent = async () => {
    const result = await dispatch(syncRecentEmails());
    if (syncRecentEmails.rejected.match(result)) {
      setShowErrorDialog(true);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchEmails(true));
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "unread" && !email.is_read) ||
      (filter === "starred" && email.is_starred);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="space-y-6">
        {/* Controls */}
        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  onClick={() => setFilter("unread")}
                  size="sm"
                >
                  Unread
                </Button>
                <Button
                  variant={filter === "starred" ? "default" : "outline"}
                  onClick={() => setFilter("starred")}
                  size="sm"
                >
                  Starred
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="default"
                  onClick={handleSyncRecent}
                  size="sm"
                  disabled={syncing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Last 2'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No emails found</h3>
              <p className="text-muted-foreground">
                {emails.length === 0 
                  ? "Connect your Gmail account in Profile settings to start receiving emails"
                  : "No emails match your search criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEmails.map((email) => (
              <Card
                key={email.id}
                className={`border-border cursor-pointer hover:shadow-md transition-shadow ${
                  !email.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => setSelectedEmail(email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold text-foreground truncate ${
                          !email.is_read ? 'font-bold' : ''
                        }`}>
                          {email.subject}
                        </h3>
                        {!email.is_read && (
                          <Badge variant="default" className="bg-primary">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">From:</span> {email.sender}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {email.snippet}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(email.date)}</span>
                        {(() => {
                          // Ensure labels is always an array
                          let labels: string[] = [];
                          if (Array.isArray(email.labels)) {
                            labels = email.labels;
                          } else if (typeof email.labels === 'string' && email.labels) {
                            labels = email.labels.split(',').map(l => l.trim()).filter(Boolean);
                          }
                          return labels.length > 0 && (
                            <div className="flex gap-1">
                              {labels.slice(0, 3).map((label: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(email);
                        }}
                      >
                        {email.is_starred ? (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(email);
                        }}
                      >
                        {email.is_read ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Email Detail Dialog */}
        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-border">
            {selectedEmail && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground">{selectedEmail.subject}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    <div className="space-y-1 mt-2">
                      <p><strong>From:</strong> {selectedEmail.sender}</p>
                      <p><strong>To:</strong> {selectedEmail.recipient}</p>
                      <p><strong>Date:</strong> {formatDate(selectedEmail.date)}</p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-foreground">
                      {selectedEmail.body || selectedEmail.snippet}
                    </div>
                  </div>
                </div>
              </>
            )}
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
                {error || 'An error occurred'}
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
    </div>
  );
}
