"use client";

import { useEffect, useMemo, useState } from "react";

import {
  emptyBayarForm,
  emptyCustomerForm,
  emptyKasbonForm,
  today,
} from "@/features/pelanggan/constants";
import type {
  BayarForm,
  Customer,
  CustomerForm,
  KasbonForm,
  Transaction,
} from "@/features/pelanggan/types";
import { computeCustomerSummary } from "@/features/pelanggan/utils";
import {
  createBayar,
  createKasbon,
  createPelanggan,
  deletePelanggan,
  fetchAllTransaksi,
  fetchPelanggan,
  updatePelanggan,
} from "@/lib/services/pelanggan.service";

type NoticeTone = "success" | "delete";

type NoticeState = {
  title: string;
  description: string;
  tone: NoticeTone;
} | null;

function buildNotice(description: string, tone: NoticeTone): NonNullable<NoticeState> {
  return {
    title: tone === "success" ? "Berhasil" : "Gagal",
    description,
    tone,
  };
}

export function usePelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isKasbonModalOpen, setIsKasbonModalOpen] = useState(false);
  const [isBayarModalOpen, setIsBayarModalOpen] = useState(false);

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] =
    useState<CustomerForm>(emptyCustomerForm);
  const [kasbonForm, setKasbonForm] = useState<KasbonForm>(emptyKasbonForm);
  const [bayarForm, setBayarForm] = useState<BayarForm>(emptyBayarForm);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  const loadPageData = async () => {
    const [nextCustomers, nextTransactions] = await Promise.all([
      fetchPelanggan(),
      fetchAllTransaksi(),
    ]);

    setCustomers(nextCustomers);
    setTransactions(nextTransactions);
  };

  useEffect(() => {
    let isActive = true;

    const init = async () => {
      setIsLoading(true);

      try {
        const [nextCustomers, nextTransactions] = await Promise.all([
          fetchPelanggan(),
          fetchAllTransaksi(),
        ]);

        if (!isActive) return;
        setCustomers(nextCustomers);
        setTransactions(nextTransactions);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void init();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const text = query.trim().toLowerCase();
    return customers
      .filter((customer) => {
        if (!text) return true;
        return (
          customer.nama.toLowerCase().includes(text) ||
          customer.no_hp.includes(text)
        );
      })
      .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  }, [customers, query]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  const selectedTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions
      .filter((item) => item.customerId === selectedCustomerId)
      .sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
      );
  }, [selectedCustomerId, transactions]);

  const selectedSummary = useMemo(() => {
    if (!selectedCustomer) return null;
    return computeCustomerSummary(selectedCustomer, selectedTransactions, today);
  }, [selectedCustomer, selectedTransactions]);

  const openCreateCustomer = () => {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = () => {
    if (!selectedCustomer) return;
    setEditingCustomerId(selectedCustomer.id);
    setCustomerForm({
      nama: selectedCustomer.nama,
      no_hp: selectedCustomer.no_hp,
      alamat: selectedCustomer.alamat,
    });
    setIsCustomerModalOpen(true);
  };

  const saveCustomer = async (values: CustomerForm) => {
    if (!values.nama.trim()) return;

    setNotice(null);

    if (editingCustomerId) {
      const ok = await updatePelanggan(editingCustomerId, values);
      if (!ok) {
        setNotice(buildNotice("Pelanggan gagal diperbarui. Coba lagi.", "delete"));
        return;
      }

      await loadPageData();
      setNotice(buildNotice("Data pelanggan berhasil diperbarui.", "success"));
    } else {
      const newCustomer = await createPelanggan(values);
      if (!newCustomer) {
        setNotice(buildNotice("Pelanggan baru gagal ditambahkan. Coba lagi.", "delete"));
        return;
      }

      await loadPageData();
      setNotice(buildNotice("Pelanggan baru berhasil ditambahkan.", "success"));
    }

    setIsCustomerModalOpen(false);
  };

  const deleteSelectedCustomer = async () => {
    if (!selectedCustomerId) return;

    setNotice(null);
    setIsDeleting(true);

    const ok = await deletePelanggan(selectedCustomerId);
    setIsDeleting(false);

    if (!ok) {
      setNotice(buildNotice("Pelanggan gagal dihapus. Coba lagi.", "delete"));
      return;
    }

    await loadPageData();
    setSelectedCustomerId(null);
    setIsDeleteModalOpen(false);
    setNotice(buildNotice("Pelanggan berhasil dihapus.", "success"));
  };

  const openKasbonModal = () => {
    setKasbonForm({ ...emptyKasbonForm, tanggalKasbon: today });
    setIsKasbonModalOpen(true);
  };

  const saveKasbon = async (values: KasbonForm) => {
    if (!selectedCustomerId) return;

    setNotice(null);

    const newKasbon = await createKasbon(selectedCustomerId, values);
    if (!newKasbon) {
      setNotice(buildNotice("Kasbon gagal ditambahkan. Coba lagi.", "delete"));
      return;
    }

    await loadPageData();
    setIsKasbonModalOpen(false);
    setNotice(buildNotice("Kasbon baru berhasil dicatat.", "success"));
  };

  const openBayarModal = () => {
    const sisa = selectedSummary?.sisaUtang ?? 0;
    setBayarForm({
      ...emptyBayarForm,
      tanggalBayar: today,
      nominal: sisa ? String(sisa) : "",
    });
    setIsBayarModalOpen(true);
  };

  const saveBayar = async (values: BayarForm) => {
    if (!selectedCustomerId || !selectedSummary) return;

    setNotice(null);

    const newBayar = await createBayar(
      selectedCustomerId,
      selectedSummary.sisaUtang,
      values,
    );
    if (!newBayar) {
      setNotice(buildNotice("Pembayaran gagal dicatat. Coba lagi.", "delete"));
      return;
    }

    await loadPageData();
    setIsBayarModalOpen(false);
    setNotice(buildNotice("Pembayaran berhasil dicatat.", "success"));
  };

  return {
    bayarForm,
    customerForm,
    notice,
    isDeleting,
    isLoading,
    filteredCustomers,
    isBayarModalOpen,
    isCustomerModalOpen,
    isDeleteModalOpen,
    isEditingCustomer: Boolean(editingCustomerId),
    isKasbonModalOpen,
    kasbonForm,
    selectedCustomer,
    selectedSummary,
    selectedTransactions,
    transactions,
    query,
    setNotice,
    setQuery,
    setSelectedCustomerId,
    setIsCustomerModalOpen,
    setIsDeleteModalOpen,
    setIsKasbonModalOpen,
    setIsBayarModalOpen,
    openCreateCustomer,
    openEditCustomer,
    deleteSelectedCustomer,
    openKasbonModal,
    saveKasbon,
    openBayarModal,
    saveBayar,
    saveCustomer,
  };
}
