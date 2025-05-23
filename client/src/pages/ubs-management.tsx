import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { UbsList } from "@/components/ubs/ubs-list";
import { UbsForm } from "@/components/ubs/ubs-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

export default function UbsManagement() {
  const [showNewUbsModal, setShowNewUbsModal] = useState(false);
  const [editUbsId, setEditUbsId] = useState<number | undefined>(undefined);
  
  // Open edit modal with UBS ID
  const handleEditUbs = (id: number) => {
    setEditUbsId(id);
  };
  
  // Open new UBS modal
  const handleNewUbs = () => {
    setShowNewUbsModal(true);
  };
  
  // Close either modal
  const handleCloseModal = () => {
    setShowNewUbsModal(false);
    setEditUbsId(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header 
          title="Unidades Básicas de Saúde"
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Unidades UBS", path: "/ubs" },
          ]}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <UbsList onEdit={handleEditUbs} onNew={handleNewUbs} />
        </main>
        
        {/* New UBS Modal */}
        <Dialog open={showNewUbsModal} onOpenChange={setShowNewUbsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Unidade Básica de Saúde</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar uma nova UBS no sistema
              </DialogDescription>
            </DialogHeader>
            <UbsForm onComplete={handleCloseModal} />
          </DialogContent>
        </Dialog>
        
        {/* Edit UBS Modal */}
        <Dialog open={!!editUbsId} onOpenChange={() => setEditUbsId(undefined)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar Unidade Básica de Saúde</DialogTitle>
              <DialogDescription>
                Atualize as informações da UBS
              </DialogDescription>
            </DialogHeader>
            {editUbsId && <UbsForm ubsId={editUbsId} isEdit={true} onComplete={handleCloseModal} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
