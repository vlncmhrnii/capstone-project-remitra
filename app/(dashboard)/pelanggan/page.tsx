"use client";

import { AnimatePresence } from "framer-motion";
import Alert from "@/components/alert/Alert";
import { usePelangganPage } from "@/hooks/usePelangganPage";
import BayarModal from "./_components/BayarModal";
import CustomerModal from "./_components/CustomerModal";
import DeleteConfirmModal from "./_components/DeleteConfirmModal";
import KasbonModal from "./_components/KasbonModal";
import PelangganDetailView from "./_components/PelangganDetailView";
import { useEffect, useState } from "react";
import { kirimTagihanWA, getLastReminderLog } from "@/lib/services/pelanggan.service";
import PelangganListView from "./_components/PelangganListView";
import PelangganPageSkeleton from "./_components/PelangganPageSkeleton";

export default function PelangganPage() {
  const {
    bayarForm,
    customerForm,
    notice,
    isDeleting,
    isLoading,
    filteredCustomers,
    isBayarModalOpen,
    isCustomerModalOpen,
    isDeleteModalOpen,
    isEditingCustomer,
    isKasbonModalOpen,
    kasbonForm,
    query,
    saveBayar,
    saveCustomer,
    saveKasbon,
    selectedCustomer,
    selectedSummary,
    selectedTransactions,
    setNotice,
    setIsBayarModalOpen,
    setIsCustomerModalOpen,
    setIsDeleteModalOpen,
    setIsKasbonModalOpen,
    setQuery,
    setSelectedCustomerId,
    transactions,
    deleteSelectedCustomer,
    openBayarModal,
    openCreateCustomer,
    openEditCustomer,
    openKasbonModal,
  } = usePelangganPage();

  // State untuk info terakhir ditagih
  const [terakhirDitagih, setTerakhirDitagih] = useState<string | null>(null);
  const [namaToko, setNamaToko] = useState<string>("Toko Kami");

  // Ambil nama toko dan reminder log saat customer dipilih
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCustomer || !selectedSummary || !selectedTransactions) return;
      // Ambil nama toko dari user session
      const { data: { user } } = await (await import("@/lib/supabase.js")).createClient().auth.getUser();
      setNamaToko(user?.user_metadata?.nama_toko ?? "Toko Kami");
      // Cari transaksi kasbon terbaru
      const kasbon = selectedTransactions.find((t) => t.type === "kasbon");
      if (!kasbon) {
        setTerakhirDitagih(null);
        return;
      }
      const log = await getLastReminderLog(kasbon.id);
      setTerakhirDitagih(log);
    };
    fetchData();
  }, [selectedCustomer, selectedSummary, selectedTransactions]);

  return (
    <main className="min-h-screen -mx-3 -mt-3 px-3 pt-3 pb-4 lg:-mx-5 lg:-mt-4 lg:px-4 lg:pt-4 lg:pb-6">
      <AnimatePresence>
        {notice ? (
          <Alert
            title={notice.title}
            description={notice.description}
            type={notice.tone}
            mode="absolute"
            duration={3000}
            showCloseButton={false}
            onClose={() => setNotice(null)}
          />
        ) : null}
      </AnimatePresence>

      {isLoading ? (
        <PelangganPageSkeleton />
      ) : !selectedCustomer || !selectedSummary ? (
        <PelangganListView
          customers={filteredCustomers}
          transactions={transactions}
          query={query}
          onQueryChange={setQuery}
          onCreate={openCreateCustomer}
          onSelectCustomer={setSelectedCustomerId}
        />
      ) : (
        <PelangganDetailView
          customer={selectedCustomer}
          summary={selectedSummary}
          transactions={selectedTransactions}
          onBack={() => setSelectedCustomerId(null)}
          onOpenKasbon={openKasbonModal}
          onOpenBayar={openBayarModal}
          onOpenEdit={openEditCustomer}
          onOpenDelete={() => setIsDeleteModalOpen(true)}
          onTagihWA={async () => {
            // Cari transaksi kasbon terbaru
            const kasbon = selectedTransactions.find((t) => t.type === "kasbon");
            if (!kasbon) return;
            await kirimTagihanWA(
              kasbon.id,
              selectedCustomer.no_hp,
              selectedCustomer.nama,
              selectedSummary.sisaUtang,
              selectedSummary.janjiBayar ?? "", // fallback string kosong
              (selectedCustomer.kategori ?? "green").toLowerCase(),
              namaToko
            );
            // Refresh info reminder
            const log = await getLastReminderLog(kasbon.id);
            setTerakhirDitagih(log);
          }}
          terakhirDitagih={terakhirDitagih}
        />
      )}

      <CustomerModal
        open={isCustomerModalOpen}
        isEditing={isEditingCustomer}
        initialValues={customerForm}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={saveCustomer}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        loading={isDeleting}
        name={selectedCustomer?.nama}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSelectedCustomer}
      />

      <KasbonModal
        open={isKasbonModalOpen}
        form={kasbonForm}
        onClose={() => setIsKasbonModalOpen(false)}
        onSubmit={saveKasbon}
      />

      <BayarModal
        open={isBayarModalOpen}
        form={bayarForm}
        totalUtang={selectedSummary?.sisaUtang ?? 0}
        onClose={() => setIsBayarModalOpen(false)}
        onSubmit={saveBayar}
      />
    </main>
  );
}
