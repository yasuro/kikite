export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          order_number: string;
          order_datetime: string;
          operator_name: string;
          operator_email: string;
          customer_code: string | null;
          customer_name: string;
          customer_name_kana: string | null;
          postal_code: string;
          prefecture: string;
          customer_address1: string;
          customer_address2: string | null;
          customer_company: string | null;
          customer_department: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          payment_method: string;
          subtotal: number;
          total_shipping_fee: number;
          total_wrapping_fee: number;
          total_fee: number;
          discount: number;
          total_amount: number;
          order_memo: string | null;
          is_csv_exported: boolean;
          csv_exported_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          order_datetime?: string;
          operator_name: string;
          operator_email: string;
          customer_code?: string | null;
          customer_name: string;
          customer_name_kana?: string | null;
          postal_code: string;
          prefecture: string;
          customer_address1: string;
          customer_address2?: string | null;
          customer_company?: string | null;
          customer_department?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          payment_method: string;
          subtotal: number;
          total_shipping_fee: number;
          total_wrapping_fee: number;
          total_fee: number;
          discount?: number;
          total_amount: number;
          order_memo?: string | null;
          is_csv_exported?: boolean;
          csv_exported_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          order_datetime?: string;
          operator_name?: string;
          operator_email?: string;
          customer_code?: string | null;
          customer_name?: string;
          customer_name_kana?: string | null;
          postal_code?: string;
          prefecture?: string;
          customer_address1?: string;
          customer_address2?: string | null;
          customer_company?: string | null;
          customer_department?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          payment_method?: string;
          subtotal?: number;
          total_shipping_fee?: number;
          total_wrapping_fee?: number;
          total_fee?: number;
          discount?: number;
          total_amount?: number;
          order_memo?: string | null;
          is_csv_exported?: boolean;
          csv_exported_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      order_details: {
        Row: {
          id: string;
          order_id: string;
          line_number: number;
          product_code: string;
          product_name: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          delivery_name: string;
          delivery_name_kana: string | null;
          delivery_phone: string | null;
          delivery_postal_code: string;
          delivery_prefecture: string;
          delivery_address1: string;
          delivery_address2: string | null;
          delivery_company: string | null;
          delivery_department: string | null;
          delivery_date: string | null;
          delivery_time: string | null;
          delivery_method: string | null;
          shipping_fee: number;
          delivery_memo: string | null;
          noshi_flag: boolean;
          noshi_type: string | null;
          noshi_position: string | null;
          noshi_inscription: string | null;
          noshi_inscription_custom: string | null;
          noshi_name: string | null;
          wrapping_flag: boolean;
          wrapping_type: string | null;
          wrapping_fee: number;
          message_card: string | null;
          line_memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          line_number: number;
          product_code: string;
          product_name: string;
          unit_price: number;
          quantity?: number;
          line_total: number;
          delivery_name: string;
          delivery_name_kana?: string | null;
          delivery_phone?: string | null;
          delivery_postal_code: string;
          delivery_prefecture: string;
          delivery_address1: string;
          delivery_address2?: string | null;
          delivery_company?: string | null;
          delivery_department?: string | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          delivery_method?: string | null;
          shipping_fee?: number;
          delivery_memo?: string | null;
          noshi_flag?: boolean;
          noshi_type?: string | null;
          noshi_position?: string | null;
          noshi_inscription?: string | null;
          noshi_inscription_custom?: string | null;
          noshi_name?: string | null;
          wrapping_flag?: boolean;
          wrapping_type?: string | null;
          wrapping_fee?: number;
          message_card?: string | null;
          line_memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          line_number?: number;
          product_code?: string;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          line_total?: number;
          delivery_name?: string;
          delivery_name_kana?: string | null;
          delivery_phone?: string | null;
          delivery_postal_code?: string;
          delivery_prefecture?: string;
          delivery_address1?: string;
          delivery_address2?: string | null;
          delivery_company?: string | null;
          delivery_department?: string | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          delivery_method?: string | null;
          shipping_fee?: number;
          delivery_memo?: string | null;
          noshi_flag?: boolean;
          noshi_type?: string | null;
          noshi_position?: string | null;
          noshi_inscription?: string | null;
          noshi_inscription_custom?: string | null;
          noshi_name?: string | null;
          wrapping_flag?: boolean;
          wrapping_type?: string | null;
          wrapping_fee?: number;
          message_card?: string | null;
          line_memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          regular_price: number;
          early_price: number | null;
          is_free_shipping: boolean;
          shipping_type: string | null;
          stock_quantity: number | null;
          noshi_available: boolean;
          wrapping_available: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          regular_price: number;
          early_price?: number | null;
          is_free_shipping?: boolean;
          shipping_type?: string | null;
          stock_quantity?: number | null;
          noshi_available?: boolean;
          wrapping_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          regular_price?: number;
          early_price?: number | null;
          is_free_shipping?: boolean;
          shipping_type?: string | null;
          stock_quantity?: number | null;
          noshi_available?: boolean;
          wrapping_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          code: string;
          name: string;
          postal_code: string;
          prefecture: string;
          address1: string;
          phone: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          postal_code: string;
          prefecture: string;
          address1: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          postal_code?: string;
          prefecture?: string;
          address1?: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
