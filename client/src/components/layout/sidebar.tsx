import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Sidebar items configuration
  const sidebarItems = [
    {
      title: "Principal",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/",
          active: location === "/",
          roles: ["admin", "doctor", "nurse", "staff"],
        },
        {
          label: "Unidades UBS",
          icon: Building2,
          href: "/ubs",
          active: location === "/ubs",
          roles: ["admin", "doctor", "nurse"],
        },
        {
          label: "Funcionários",
          icon: Users,
          href: "/employees",
          active: location === "/employees",
          roles: ["admin"],
        },
        {
          label: "Doenças",
          icon: Stethoscope,
          href: "/diseases",
          active: location === "/diseases",
          roles: ["admin", "doctor"],
        },
        {
          label: "Prontuários",
          icon: ClipboardList,
          href: "/medical-records",
          active: location === "/medical-records",
          roles: ["admin", "doctor", "nurse"],
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          label: "Configurações",
          icon: Settings,
          href: "/settings",
          active: location === "/settings",
          roles: ["admin"],
        },
        {
          label: "Ajuda",
          icon: HelpCircle,
          href: "/help",
          active: location === "/help",
          roles: ["admin", "doctor", "nurse", "staff"],
        },
      ],
    },
  ];

  // Filter items based on user role
  const filteredSidebarItems = sidebarItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      user && item.roles.includes(user.role)
    )
  })).filter(section => section.items.length > 0);

  // Mobile menu button
  const mobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 right-4 z-50"
      onClick={toggleMobileMenu}
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center justify-center md:justify-start">
          <Building2 className="text-primary-500 h-6 w-6 mr-2" />
          <h1 className="font-heading font-semibold text-xl text-primary-500">UBS Manager</h1>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {user && (
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="text-neutral-500 h-5 w-5" />
                <div className="font-medium">{user.name}</div>
              </div>
              <div className="text-xs text-neutral-500 ml-7 capitalize">{user.role}</div>
            </div>
          )}
          
          <nav className="mt-4 space-y-2">
            {filteredSidebarItems.map((section, index) => (
              <div key={index}>
                <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {section.title}
                </div>
                
                {section.items.map((item, itemIndex) => (
                  <Link 
                    key={itemIndex} 
                    href={item.href}
                    onClick={closeMobileMenu}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-3 py-2 text-sm rounded-md font-medium",
                        item.active 
                          ? "bg-primary-50 text-primary-600" 
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>
      
      <div className="p-2 mt-auto">
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
          {logoutMutation.isPending && <span className="ml-2">...</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {mobileMenuButton}
      
      {/* Desktop sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-lg w-64 h-screen flex-shrink-0 fixed left-0 top-0 z-30 flex flex-col overflow-hidden hidden md:flex",
          className
        )}
      >
        {sidebarContent}
      </aside>
      
      {/* Mobile sidebar */}
      {mobileOpen && (
        <aside 
          className="bg-white shadow-lg w-full h-screen fixed left-0 top-0 z-40 flex flex-col overflow-hidden md:hidden"
        >
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
