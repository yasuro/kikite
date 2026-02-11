import { z } from "zod";

export const orderDetailSchema = z.object({
  line_number: z.number().int().min(1),
  product_code: z.string().min(1, "商品を選択してください"),
  product_name: z.string().min(1),
  unit_price: z.number().int().min(0),
  quantity: z.number().int().min(1, "1以上の数量を入力してください"),
  is_free_shipping: z.boolean().default(false),
  delivery_name: z.string().min(1, "お届け先氏名を入力してください"),
  delivery_name_kana: z.string().optional().nullable(),
  delivery_phone: z.string().optional().nullable(),
  delivery_postal_code: z
    .string()
    .min(1, "お届け先郵便番号を入力してください")
    .regex(/^\d{7}$/, "7桁の数字で入力してください"),
  delivery_prefecture: z.string().min(1, "都道府県を入力してください"),
  delivery_address1: z.string().min(1, "お届け先住所を入力してください"),
  delivery_address2: z.string().optional().nullable(),
  delivery_company: z.string().optional().nullable(),
  delivery_department: z.string().optional().nullable(),
  delivery_date: z.string().optional().nullable(),
  delivery_time: z.string().optional().nullable(),
  delivery_method: z.string().optional().nullable(),
  delivery_memo: z.string().optional().nullable(),
  noshi_type: z.string().optional().nullable(),
  noshi_position: z.string().optional().nullable(),
  noshi_inscription: z.string().optional().nullable(),
  noshi_inscription_custom: z.string().optional().nullable(),
  noshi_name: z.string().optional().nullable(),
  wrapping_type: z.string().optional().nullable(),
  message_card: z.string().optional().nullable(),
  line_memo: z.string().optional().nullable(),
});

export const orderSchema = z.object({
  customer_code: z.string().optional().nullable(),
  customer_name: z.string().min(1, "注文者氏名を入力してください"),
  customer_name_kana: z.string().optional().nullable(),
  postal_code: z
    .string()
    .min(1, "郵便番号を入力してください")
    .regex(/^\d{7}$/, "7桁の数字で入力してください"),
  prefecture: z.string().min(1, "都道府県を入力してください"),
  customer_address1: z.string().min(1, "住所を入力してください"),
  customer_address2: z.string().optional().nullable(),
  customer_company: z.string().optional().nullable(),
  customer_department: z.string().optional().nullable(),
  customer_phone: z.string().optional().nullable(),
  customer_email: z.string().optional().nullable(),
  payment_method: z.enum(["代金引換", "クレジットカード", "銀行振込", "後払い"]),
  discount: z.number().int().min(0).default(0),
  order_memo: z.string().optional().nullable(),
  details: z.array(orderDetailSchema).min(1, "1つ以上の商品を追加してください"),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderDetailFormData = z.infer<typeof orderDetailSchema>;
