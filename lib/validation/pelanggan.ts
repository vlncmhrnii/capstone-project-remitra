import { z } from "zod";

export const customerSchema = z.object({
  nama: z.string().trim().min(2, "Nama pelanggan wajib diisi."),
  no_hp: z.string().trim().min(8, "Nomor HP minimal 8 karakter."),
  alamat: z.string().trim().min(3, "Alamat pelanggan wajib diisi."),
});

export const kasbonSchema = z.object({
  nominal: z
    .string()
    .trim()
    .min(1, "Nominal kasbon wajib diisi.")
    .refine((value) => Number(value) > 0, "Nominal kasbon harus lebih dari 0."),
  tanggalKasbon: z.string().min(1, "Tanggal kasbon wajib diisi."),
  tanggalJanji: z.string().min(1, "Tanggal janji bayar wajib diisi."),
  target: z.enum(["lunas", "cicil"]),
  keterangan: z.string().trim().optional().or(z.literal("")),
});

export const bayarSchema = z
  .object({
    jenis: z.enum(["lunas", "sebagian"]),
    nominal: z
      .string()
      .trim()
      .min(1, "Nominal bayar wajib diisi.")
      .refine((value) => Number(value) > 0, "Nominal bayar harus lebih dari 0."),
    tanggalBayar: z.string().min(1, "Tanggal bayar wajib diisi."),
    tanggalJanji: z.string().optional(),
    keterangan: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.jenis === "sebagian" && !values.tanggalJanji?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tanggalJanji"],
        message: "Tanggal janji bayar wajib diisi untuk pembayaran sebagian.",
      });
    }
  });
