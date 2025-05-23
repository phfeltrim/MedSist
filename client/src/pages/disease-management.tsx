import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DiseaseList } from "@/components/disease/disease-list";
import { DiseaseForm } from "@/components/disease/disease-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function DiseaseManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiseaseId, setEditingDiseaseId] = useState<number | undefined>(undefined);

  const handleNewDisease = () => {
    setEditingDiseaseId(undefined);
    setIsFormOpen(true);
  };

  const handleEditDisease = (id: number) => {
    setEditingDiseaseId(id);
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
          title="Doenças"
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Doenças" }
          ]}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <DiseaseList onNew={handleNewDisease} onEdit={handleEditDisease} />
        </main>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DiseaseForm 
              diseaseId={editingDiseaseId} 
              isEdit={!!editingDiseaseId} 
              onComplete={handleCloseForm} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}