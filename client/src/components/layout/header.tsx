import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, 
  ChevronRight, 
  Plus
} from "lucide-react";

interface HeaderProps {
  title: string;
  breadcrumbs: Array<{
    label: string;
    path?: string;
  }>;
  actionLabel?: string;
  actionPath?: string;
  onActionClick?: () => void;
}

export function Header({ 
  title, 
  breadcrumbs, 
  actionLabel, 
  actionPath,
  onActionClick
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-neutral-800">{title}</h1>
            <div className="flex items-center space-x-1 text-sm text-neutral-500">
              {breadcrumbs.map((item, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-neutral-400 mx-1" />}
                  {item.path ? (
                    <Link href={item.path} className="hover:text-primary-500">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-500 hover:bg-neutral-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {actionLabel && (
              onActionClick ? (
                <Button 
                  onClick={onActionClick}
                  className="hidden md:flex"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {actionLabel}
                </Button>
              ) : actionPath ? (
                <Button asChild className="hidden md:flex">
                  <Link href={actionPath}>
                    <Plus className="h-4 w-4 mr-1" />
                    {actionLabel}
                  </Link>
                </Button>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
