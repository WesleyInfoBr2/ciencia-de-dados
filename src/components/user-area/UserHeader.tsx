import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Bell, 
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface UserHeaderProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const UserHeader = ({
  title,
  onMenuClick,
  showMenuButton = false,
}: UserHeaderProps) => {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-heading font-semibold text-foreground">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            2
          </Badge>
        </Button>

        {/* Back to home */}
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Página Inicial
          </Link>
        </Button>
      </div>
    </header>
  );
};
