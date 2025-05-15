import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  UserPlus, 
  Folder, 
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "update" | "create" | "delete" | "add-employee";

interface Activity {
  id: number;
  type: ActivityType;
  performer: string;
  subject?: string;
  timestamp: string;
}

interface ActivityLogProps {
  activities: Activity[];
  isLoading?: boolean;
}

export function ActivityLog({ activities, isLoading = false }: ActivityLogProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "update":
        return <CheckCircle className="h-4 w-4" />;
      case "add-employee":
        return <UserPlus className="h-4 w-4" />;
      case "create":
        return <Folder className="h-4 w-4" />;
      case "delete":
        return <Trash className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActivityIconClass = (type: ActivityType) => {
    switch (type) {
      case "update":
        return "bg-green-100 text-green-500";
      case "add-employee":
        return "bg-blue-100 text-blue-500";
      case "create":
        return "bg-yellow-100 text-yellow-500";
      case "delete":
        return "bg-red-100 text-red-500";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "update":
        return (
          <>
            <span className="font-medium">{activity.performer}</span>{" "}
            <span className="text-neutral-600">atualizou o prontuário de</span>{" "}
            <span className="font-medium">{activity.subject}</span>
          </>
        );
      case "add-employee":
        return (
          <>
            <span className="font-medium">{activity.performer}</span>{" "}
            <span className="text-neutral-600">cadastrou novo funcionário</span>{" "}
            <span className="font-medium">{activity.subject}</span>
          </>
        );
      case "create":
        return (
          <>
            <span className="font-medium">{activity.performer}</span>{" "}
            <span className="text-neutral-600">criou novo prontuário para</span>{" "}
            <span className="font-medium">{activity.subject}</span>
          </>
        );
      case "delete":
        return (
          <>
            <span className="font-medium">{activity.performer}</span>{" "}
            <span className="text-neutral-600">removeu prontuário de</span>{" "}
            <span className="font-medium">{activity.subject}</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {isLoading ? (
            // Loading placeholder
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex animate-pulse">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-1/3 bg-neutral-200 rounded mt-2"></div>
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Nenhuma atividade recente
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    getActivityIconClass(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <Button variant="ghost" className="w-full mt-4">
          Ver todas as atividades
        </Button>
      </CardContent>
    </Card>
  );
}
