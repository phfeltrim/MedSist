import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  iconClassName?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend,
  iconClassName
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">{label}</p>
            <h2 className="text-2xl font-semibold mt-1">{value}</h2>
            {trend && (
              <p className={cn(
                "text-xs flex items-center mt-1",
                trend.direction === "up" ? "text-green-500" : "text-red-500"
              )}>
                <span className="material-icons text-xs mr-1">
                  {trend.direction === "up" ? "arrow_upward" : "arrow_downward"}
                </span>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            iconClassName || "bg-primary-50"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
