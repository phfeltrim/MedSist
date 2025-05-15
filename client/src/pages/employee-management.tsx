import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { EmployeeList } from "@/components/employee/employee-list";
import { EmployeeForm } from "@/components/employee/employee-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function EmployeeManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | undefined>(undefined);

  const handleNewEmployee = () => {
    setEditingEmployeeId(undefined);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (id: number) => {
    setEditingEmployeeId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header 
          title="Funcionários"
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Funcionários" },
          ]}
          actionLabel="Novo Funcionário"
          onActionClick={handleNewEmployee}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <EmployeeList onNew={handleNewEmployee} onEdit={handleEditEmployee} />
        </main>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl p-0">
            <EmployeeForm 
              employeeId={editingEmployeeId} 
              isEdit={!!editingEmployeeId} 
              onComplete={handleCloseForm} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
