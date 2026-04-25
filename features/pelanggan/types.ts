export type PaymentTarget = "lunas" | "cicil";
export type PaymentType = "lunas" | "sebagian";
export type CategoryLabel = "Green" | "Yellow" | "Red" | "Black";

export type Customer = {
  id: string;
  nama: string;
  no_hp: string;
  alamat: string;
  created_at: string;
  skor_keterlambatan?: number;
  kategori?: CategoryLabel;
};

export type Transaction = {
  id: string;
  customerId: string;
  type: "kasbon" | "bayar";
  nominal: number;
  tanggal: string;
  tanggalJanji?: string;
  target?: PaymentTarget;
  keterangan?: string;
  status?: string; 
  nama?: string;   
  no_hp?: string;  
};

export type CustomerForm = {
  nama: string;
  no_hp: string;
  alamat: string;
};

export type KasbonForm = {
  nominal: string;
  tanggalKasbon: string;
  tanggalJanji: string;
  target: PaymentTarget;
  keterangan?: string;
};

export type BayarForm = {
  jenis: PaymentType;
  nominal: string;
  tanggalBayar: string;
  tanggalJanji?: string;
  keterangan?: string;
};

export type CustomerSummary = {
  totalKasbon: number;
  totalBayar: number;
  sisaUtang: number;
  janjiBayar?: string;
  overdueDays: number;
  isJatuhTempo: boolean;
  kategori: CategoryLabel;
};
