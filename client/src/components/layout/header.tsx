import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAppSelector((state) => state.auth);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex-1 flex items-center gap-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboard, emails, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-background border-border focus-visible:ring-ring rounded-lg"
          />
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
        {user && (
          <div className="ml-2 text-sm text-muted-foreground hidden sm:block font-medium">
            {user.username}
          </div>
        )}
      </div>
    </div>
  );
}
