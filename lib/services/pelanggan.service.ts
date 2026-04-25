// Template pesan WhatsApp per kategori
export function buatPesanWA(
  kategori: string,
  nama: string,
  jumlah: number,
  tanggalJanji: string,
  namaToko: string,
): string {
  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const fmtTgl = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const hariLewat = Math.max(
    Math.floor(
      (new Date().getTime() - new Date(tanggalJanji).getTime()) / 86400000,
    ),
    0,
  );
  const batasWaktu = new Date(Date.now() + 3 * 86400000).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long" },
  );

  if (kategori === "yellow") {
    return `Halo Kak ${nama} \n\nMaaf mengganggu ya, mau mengingatkan bahwa kasbon sebesar *${fmt(jumlah)}* akan jatuh tempo pada ${fmtTgl(tanggalJanji)}.\n\nKalau sudah siap, bisa langsung dilunasi atau kabari kami dulu ya Kak \n\nTerima kasih banyak!\n— ${namaToko}`;
  }

  if (kategori === "red") {
    return `Halo Kak ${nama},\n\nKami ingin menginformasikan bahwa kasbon sebesar *${fmt(jumlah)}* sudah melewati jatuh tempo sejak ${fmtTgl(tanggalJanji)} (${hariLewat} hari yang lalu).\n\nMohon segera lakukan pembayaran atau hubungi kami untuk mengatur cicilan.\n\nJika tidak ada konfirmasi hingga ${batasWaktu}, kami terpaksa menunda layanan kasbon sementara.\n\nTerima kasih\n— ${namaToko}`;
  }

  if (kategori === "black") {
    return `Yth. Bapak/Ibu ${nama},\n\nIni adalah pengingat terakhir kami terkait kasbon sebesar *${fmt(jumlah)}* yang telah jatuh tempo sejak ${fmtTgl(tanggalJanji)} (${hariLewat} hari).\n\nKami sangat mengharapkan pembayaran atau konfirmasi dari Anda *hari ini*.\n\nTanpa konfirmasi, layanan kasbon untuk akun Anda akan kami hentikan secara permanen.\n\nHubungi kami segera di nomor ini.\n— ${namaToko}`;
  }

  // Default Green
  return `Halo Kak ${nama}, mengingatkan kasbon sebesar *${fmt(jumlah)}* jatuh tempo pada ${fmtTgl(tanggalJanji)}. Terima kasih \n— ${namaToko}`;
}

// Kirim tagihan via WhatsApp dan log ke reminder_log
export async function kirimTagihanWA(
  kasbonId: string,
  noHp: string,
  nama: string,
  jumlah: number,
  tanggalJanji: string,
  kategori: string,
  namaToko: string,
): Promise<void> {
  const pesan = buatPesanWA(kategori, nama, jumlah, tanggalJanji, namaToko);
  const nomor = noHp.startsWith("0") ? "62" + noHp.slice(1) : noHp;
  if (typeof window !== "undefined") {
    window.open(
      `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`,
      "_blank",
    );
  }

  await supabase.from("reminder_log").insert({
    kasbon_id: kasbonId,
    tipe: `wa_${kategori}`,
    status_kirim: "diklik",
    dikirim_at: new Date().toISOString(),
  });
}

// Ambil log pengingat terakhir untuk kasbon tertentu
export async function getLastReminderLog(
  kasbonId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("reminder_log")
    .select("dikirim_at")
    .eq("kasbon_id", kasbonId)
    .order("dikirim_at", { ascending: false })
    .limit(1)
    .single();
  if (error || !data?.dikirim_at) return null;
  return data.dikirim_at;
}
import { createClient } from "@/lib/supabase.js";
import type { Customer, Transaction } from "@/features/pelanggan/types";
import { normalizeCategoryLabel } from "@/features/pelanggan/utils";

const supabase = createClient();

type CustomerDirectoryEntry = {
  id: string;
  nama: string | null;
  no_hp: string | null;
};

async function syncKategoriPelanggan(pelangganId: string) {
  const { data: kasbonAktif, error: kasbonError } = await supabase
    .from("kasbon")
    .select("jatuh_tempo, tanggal_janji")
    .eq("pelanggan_id", pelangganId)
    .neq("status", "lunas");

  if (kasbonError) {
    console.error(kasbonError);
    return;
  }

  const todayDate = new Date(new Date().toISOString().split("T")[0]);
  const skorKeterlambatan = (kasbonAktif ?? []).reduce((total, kasbon) => {
    const dueDate = kasbon.jatuh_tempo ?? kasbon.tanggal_janji;
    if (!dueDate) return total;
    const overdue = Math.floor(
      (todayDate.getTime() - new Date(dueDate).getTime()) / 86400000,
    );
    return total + Math.min(Math.max(overdue, 0), 30);
  }, 0);

  await supabase
    .from("pelanggan")
    .update({ skor_keterlambatan: skorKeterlambatan })
    .eq("id", pelangganId);

  await updateKategoriGabungan(pelangganId, skorKeterlambatan);
}

export async function recalculateAllPelangganKategori(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pelangganData, error } = await supabase
    .from("pelanggan")
    .select("id")
    .eq("toko_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  for (const pelanggan of pelangganData ?? []) {
    await syncKategoriPelanggan(pelanggan.id);
  }
}

export async function fetchAllTransaksi(): Promise<Transaction[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: kasbonData, error: kasbonError } = await supabase
    .from("kasbon")
    .select(
      "id, pelanggan_id, jumlah, tanggal_pinjam, tanggal_janji, jatuh_tempo, target_bayar, catatan, status",
    )
    .eq("toko_id", user.id)
    .order("tanggal_pinjam", { ascending: false });

  if (kasbonError) {
    console.error(kasbonError);
    return [];
  }

  const kasbonIds = (kasbonData ?? []).map((item) => item.id);

  const { data: cicilanData, error: cicilanError } =
    kasbonIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("cicilan")
          .select(
            "id, kasbon_id, jumlah_bayar, tanggal_bayar, janji_bayar_berikutnya",
          )
          .in("kasbon_id", kasbonIds)
          .order("tanggal_bayar", { ascending: false });

  if (cicilanError) {
    console.error(cicilanError);
    return [];
  }

  const customerIds = Array.from(
    new Set(
      (kasbonData ?? []).map((item) => item.pelanggan_id).filter(Boolean),
    ),
  );

  const { data: pelangganData, error: pelangganError } =
    customerIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("pelanggan")
          .select("id, nama, no_hp")
          .in("id", customerIds);

  if (pelangganError) {
    console.error(pelangganError);
    return [];
  }

  const customerById = new Map<string, CustomerDirectoryEntry>(
    (pelangganData ?? []).map((item) => [item.id, item]),
  );
  const kasbonById = new Map((kasbonData ?? []).map((item) => [item.id, item]));

  const kasbonList: Transaction[] = (kasbonData ?? []).map((k) => ({
    id: k.id,
    customerId: k.pelanggan_id,
    type: "kasbon",
    nominal: k.jumlah,
    tanggal: k.tanggal_pinjam,
    tanggalJanji: k.jatuh_tempo ?? k.tanggal_janji ?? undefined,
    target: k.target_bayar === "sebagian" ? "cicil" : "lunas",
    keterangan: k.catatan ?? undefined,
    status: k.status,
    nama: customerById.get(k.pelanggan_id)?.nama ?? undefined,
    no_hp: customerById.get(k.pelanggan_id)?.no_hp ?? undefined,
  }));

  const cicilanList: Transaction[] = (cicilanData ?? []).flatMap((c) => {
    const kasbon = kasbonById.get(c.kasbon_id);
    if (!kasbon?.pelanggan_id) return [];

    const customer = customerById.get(kasbon.pelanggan_id);

    return [
      {
        id: c.id,
        customerId: kasbon.pelanggan_id,
        type: "bayar",
        nominal: c.jumlah_bayar,
        tanggal: c.tanggal_bayar,
        tanggalJanji: c.janji_bayar_berikutnya ?? undefined,
        keterangan: undefined,
        status: kasbon.status,
        nama: customer?.nama ?? undefined,
        no_hp: customer?.no_hp ?? undefined,
      },
    ];
  });

  return [...kasbonList, ...cicilanList].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
  );
}

export async function fetchPelanggan(): Promise<Customer[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pelanggan")
    .select("*")
    .eq("toko_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    nama: p.nama,
    no_hp: p.no_hp,
    alamat: p.alamat ?? "",
    created_at: p.created_at,
    skor_keterlambatan: p.skor_keterlambatan ?? 0,
    kategori: normalizeCategoryLabel(p.kategori),
  }));
}

export async function updateKategoriGabungan(
  pelangganId: string,
  skor: number,
) {
  let kategori: string;
  if (skor <= 0) kategori = "green";
  else if (skor <= 7) kategori = "yellow";
  else if (skor <= 30) kategori = "red";
  else kategori = "black";

  await supabase.from("pelanggan").update({ kategori }).eq("id", pelangganId);
}

export async function createPelanggan(form: {
  nama: string;
  no_hp: string;
  alamat: string;
}): Promise<Customer | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("pelanggan")
    .insert({
      toko_id: user.id,
      nama: form.nama.trim(),
      no_hp: form.no_hp.trim(),
      alamat: form.alamat.trim() || null,
      kategori: "green",
      skor_keterlambatan: 0,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return {
    id: data.id,
    nama: data.nama,
    no_hp: data.no_hp,
    alamat: data.alamat ?? "",
    created_at: data.created_at,
  };
}

export async function updatePelanggan(
  id: string,
  form: { nama: string; no_hp: string; alamat: string },
): Promise<boolean> {
  const { error } = await supabase
    .from("pelanggan")
    .update({
      nama: form.nama.trim(),
      no_hp: form.no_hp.trim(),
      alamat: form.alamat.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function deletePelanggan(id: string): Promise<boolean> {
  const { error } = await supabase.from("pelanggan").delete().eq("id", id);
  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function fetchTransaksi(
  pelangganId: string,
): Promise<Transaction[]> {
  const { data: kasbonData, error: kasbonError } = await supabase
    .from("kasbon")
    .select("*")
    .eq("pelanggan_id", pelangganId)
    .order("created_at", { ascending: false });
  if (kasbonError) {
    console.error(kasbonError);
    return [];
  }

  const { data: cicilanData, error: cicilanError } = await supabase
    .from("cicilan")
    .select("*, kasbon!inner(pelanggan_id)")
    .eq("kasbon.pelanggan_id", pelangganId)
    .order("created_at", { ascending: false });
  if (cicilanError) {
    console.error(cicilanError);
    return [];
  }

  const kasbonList: Transaction[] = (kasbonData ?? []).map((k) => ({
    id: k.id,
    customerId: pelangganId,
    type: "kasbon",
    nominal: k.jumlah,
    tanggal: k.tanggal_pinjam,
    tanggalJanji: k.tanggal_janji ?? undefined,
    target: k.target_bayar === "sebagian" ? "cicil" : "lunas",
    keterangan: k.catatan ?? undefined,
  }));

  const cicilanList: Transaction[] = (cicilanData ?? []).map((c) => ({
    id: c.id,
    customerId: pelangganId,
    type: "bayar",
    nominal: c.jumlah_bayar,
    tanggal: c.tanggal_bayar,
    tanggalJanji: c.janji_bayar_berikutnya ?? undefined,
    keterangan: c.catatan ?? undefined,
  }));

  return [...kasbonList, ...cicilanList].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
  );
}

export async function createKasbon(
  pelangganId: string,
  form: {
    nominal: string;
    tanggalKasbon: string;
    tanggalJanji: string;
    target: string;
    keterangan?: string;
  },
): Promise<Transaction | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("kasbon")
    .insert({
      toko_id: user.id,
      pelanggan_id: pelangganId,
      jumlah: parseInt(form.nominal),
      tanggal_pinjam: form.tanggalKasbon,
      tanggal_janji: form.tanggalJanji || null,
      jatuh_tempo: form.tanggalJanji || null,
      target_bayar: form.target === "cicil" ? "sebagian" : "lunas",
      catatan: form.keterangan?.trim() || null,
      status: "belum_lunas",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  await syncKategoriPelanggan(pelangganId);

  return {
    id: data.id,
    customerId: pelangganId,
    type: "kasbon",
    nominal: data.jumlah,
    tanggal: data.tanggal_pinjam,
    tanggalJanji: data.tanggal_janji ?? undefined,
    target: form.target === "cicil" ? "cicil" : "lunas",
    keterangan: data.catatan ?? undefined,
  };
}

export async function createBayar(
  pelangganId: string,
  sisaUtang: number,
  form: {
    jenis: string;
    nominal: string;
    tanggalBayar: string;
    tanggalJanji?: string;
    keterangan?: string;
  },
): Promise<Transaction | null> {
  const { data: kasbonAktif, error: kasbonError } = await supabase
    .from("kasbon")
    .select("id, jumlah, status")
    .eq("pelanggan_id", pelangganId)
    .neq("status", "lunas")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (kasbonError || !kasbonAktif) {
    console.error("Tidak ada kasbon aktif", kasbonError);
    return null;
  }

  const nominalBayar =
    form.jenis === "lunas" ? sisaUtang : parseInt(form.nominal);

  const { data, error } = await supabase
    .from("cicilan")
    .insert({
      kasbon_id: kasbonAktif.id,
      jumlah_bayar: nominalBayar,
      tanggal_bayar: form.tanggalBayar,
      ada_janji: form.jenis === "sebagian" && !!form.tanggalJanji,
      janji_bayar_berikutnya: form.tanggalJanji || null,
      catatan: form.keterangan?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  const statusBaru = form.jenis === "lunas" ? "lunas" : "cicilan";
  const payloadKasbon: { status: string; jatuh_tempo?: string | null } = {
    status: statusBaru,
  };
  if (form.jenis === "sebagian" && form.tanggalJanji) {
    payloadKasbon.jatuh_tempo = form.tanggalJanji;
  }
  await supabase.from("kasbon").update(payloadKasbon).eq("id", kasbonAktif.id);

  await syncKategoriPelanggan(pelangganId);

  return {
    id: data.id,
    customerId: pelangganId,
    type: "bayar",
    nominal: nominalBayar,
    tanggal: data.tanggal_bayar,
    tanggalJanji: data.janji_bayar_berikutnya ?? undefined,
    keterangan: data.catatan ?? undefined,
  };
}

export async function fetchDashboardStats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  const awalBulan = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { data: kasbonAktif, error: kasbonAktifError },
    { data: lunasData, error: lunasDataError },
    { data: pelangganData, error: pelangganDataError },
    { data: semuaKasbonData, error: semuaKasbonError },
    { data: semuaBayarData, error: semuaBayarError },
  ] = await Promise.all([
    supabase
      .from("kasbon")
      .select(
        "id, jumlah, jatuh_tempo, status, pelanggan(nama, no_hp, kategori)",
      )
      .eq("toko_id", user.id)
      .neq("status", "lunas"),
    supabase
      .from("kasbon")
      .select("jumlah")
      .eq("toko_id", user.id)
      .eq("status", "lunas")
      .gte("created_at", awalBulan),
    supabase.from("pelanggan").select("kategori").eq("toko_id", user.id),
    supabase.from("kasbon").select("jumlah").eq("toko_id", user.id),
    supabase
      .from("cicilan")
      .select("jumlah_bayar, kasbon!inner(toko_id)")
      .eq("kasbon.toko_id", user.id),
  ]);

  const firstError =
    kasbonAktifError ??
    lunasDataError ??
    pelangganDataError ??
    semuaKasbonError ??
    semuaBayarError;

  if (firstError) {
    console.error(firstError);
    return null;
  }

  const totalPiutang = kasbonAktif?.reduce((s, k) => s + k.jumlah, 0) ?? 0;
  const totalKasbon =
    semuaKasbonData?.reduce((sum, item) => sum + item.jumlah, 0) ?? 0;
  const totalBayar =
    semuaBayarData?.reduce((sum, item) => sum + item.jumlah_bayar, 0) ?? 0;
  const sisaPiutang = Math.max(totalKasbon - totalBayar, 0);
  const transaksiAktif = kasbonAktif?.length ?? 0;
  const jatuhTempoHariIni =
    kasbonAktif?.filter((k) => k.jatuh_tempo && k.jatuh_tempo <= today)
      .length ?? 0;
  const lunasBulanIni = lunasData?.reduce((s, k) => s + k.jumlah, 0) ?? 0;
  const lunasBulanIniCount = lunasData?.length ?? 0;

  const kategoriCount = { Green: 0, Yellow: 0, Red: 0, Black: 0 };
  pelangganData?.forEach((p) => {
    const normalized = normalizeCategoryLabel(p.kategori);
    const key = normalized as keyof typeof kategoriCount;
    if (key in kategoriCount) kategoriCount[key]++;
  });

  const reminders = (kasbonAktif ?? [])
    .filter((k) => k.jatuh_tempo && k.jatuh_tempo <= today)
    .map((k) => {
      const pel = k.pelanggan as {
        nama?: string;
        no_hp?: string;
        kategori?: string;
      } | null;
      const overdue = Math.floor(
        (new Date().getTime() - new Date(k.jatuh_tempo).getTime()) / 86400000,
      );
      return {
        kasbonId: k.id,
        name: pel?.nama ?? "?",
        noHp: pel?.no_hp ?? "",
        kategori: normalizeCategoryLabel(pel?.kategori),
        jumlah: k.jumlah,
        tanggalJanji: k.jatuh_tempo,
        info: overdue === 0 ? "Jatuh tempo hari ini" : `${overdue} hari lewat`,
        amount: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(k.jumlah),
        stateClass:
          overdue === 0
            ? "text-amber-600 dark:text-amber-300"
            : "text-rose-600 dark:text-rose-300",
      };
    });

  return {
    totalKasbon,
    totalBayar,
    sisaPiutang,
    totalPiutang,
    transaksiAktif,
    jatuhTempoHariIni,
    lunasBulanIni,
    lunasBulanIniCount,
    kategoriCount,
    reminders,
  };
}
