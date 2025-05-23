import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import UbsManagement from "@/pages/ubs-management";
import EmployeeManagement from "@/pages/employee-management";
import DiseaseManagement from "@/pages/disease-management";
import MedicalRecords from "@/pages/medical-records";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/ubs" component={UbsManagement} roles={["admin", "doctor", "nurse"]} />
      <ProtectedRoute path="/employees" component={EmployeeManagement} roles={["admin"]} />
      <ProtectedRoute path="/diseases" component={DiseaseManagement} roles={["admin", "doctor"]} />
      <ProtectedRoute path="/medical-records" component={MedicalRecords} roles={["admin", "doctor", "nurse"]} />
      <ProtectedRoute path="/reports" component={Reports} roles={["admin", "doctor", "nurse"]} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
