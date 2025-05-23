import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MedicalRecordList } from "@/components/medical-record/medical-record-list";
import { MedicalRecordForm } from "@/components/medical-record/medical-record-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function MedicalRecords() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | undefined>(undefined);

  const handleNewRecord = () => {
    setEditingRecordId(undefined);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  const handleEditRecord = (id: number) => {
    setEditingRecordId(id);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  const handleViewRecord = (id: number) => {
    setEditingRecordId(id);
    setIsViewMode(true);
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
          title="Prontuários"
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Prontuários" }
          ]}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <MedicalRecordList 
            onNew={handleNewRecord} 
            onEdit={handleEditRecord}
            onView={handleViewRecord}
          />
        </main>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-5xl p-0">
            <DialogTitle className="sr-only">
              {isViewMode ? "Visualizar Prontuário" : editingRecordId ? "Editar Prontuário" : "Novo Prontuário"}
            </DialogTitle>
            <MedicalRecordForm 
              recordId={editingRecordId} 
              isEdit={!!editingRecordId && !isViewMode} 
              isView={isViewMode}
              onComplete={handleCloseForm} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
