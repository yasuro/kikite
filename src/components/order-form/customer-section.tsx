"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAddressFromPostalCode } from "@/lib/postal-code";
import type { Database } from "@/lib/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

interface CustomerSectionProps {
  values: {
    customer_code: string;
    customer_name: string;
    customer_name_kana: string;
    postal_code: string;
    prefecture: string;
    customer_address1: string;
    customer_address2: string;
    customer_company: string;
    customer_department: string;
    customer_phone: string;
    customer_email: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string | undefined>;
}

export function CustomerSection({
  values,
  onChange,
  errors,
}: CustomerSectionProps) {
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [postalLoading, setPostalLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 顧客検索
  useEffect(() => {
    if (customerQuery.length < 1) {
      setCustomerResults([]);
      setIsCustomerOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/customers/search?q=${encodeURIComponent(customerQuery)}`
        );
        const data = await res.json();
        setCustomerResults(data.customers || []);
        setIsCustomerOpen(true);
      } catch {
        setCustomerResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsCustomerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    onChange("customer_code", customer.code);
    onChange("customer_name", customer.name);
    onChange("postal_code", customer.postal_code);
    onChange("prefecture", customer.prefecture);
    onChange("customer_address1", customer.address1);
    onChange("customer_phone", customer.phone || "");
    onChange("customer_email", customer.email || "");
    setCustomerQuery(customer.code);
    setIsCustomerOpen(false);
  };

  // 郵便番号→住所変換
  const handlePostalCodeChange = async (postalCode: string) => {
    onChange("postal_code", postalCode);
    if (/^\d{7}$/.test(postalCode)) {
      setPostalLoading(true);
      const address = await fetchAddressFromPostalCode(postalCode);
      if (address) {
        onChange("prefecture", address.prefecture);
        onChange("customer_address1", address.fullAddress);
      }
      setPostalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">注文者情報</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 統合顧客番号 */}
        <div ref={containerRef} className="relative">
          <Label>統合顧客番号</Label>
          <Input
            type="text"
            placeholder="顧客番号または氏名で検索..."
            value={customerQuery || values.customer_code}
            onChange={(e) => {
              setCustomerQuery(e.target.value);
              onChange("customer_code", e.target.value);
            }}
            onFocus={() =>
              customerQuery.length >= 1 &&
              customerResults.length > 0 &&
              setIsCustomerOpen(true)
            }
          />
          {isCustomerOpen && customerResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {customerResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleCustomerSelect(c)}
                >
                  <span className="font-mono text-gray-500 mr-2">
                    {c.code}
                  </span>
                  <span>{c.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    {c.prefecture}
                    {c.address1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div />

        {/* 注文者氏名 */}
        <div>
          <Label>
            注文者氏名 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={values.customer_name}
            onChange={(e) => onChange("customer_name", e.target.value)}
            className={errors.customer_name ? "border-red-500" : ""}
          />
          {errors.customer_name && (
            <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>
          )}
        </div>

        {/* 注文者氏名カナ */}
        <div>
          <Label>注文者氏名カナ</Label>
          <Input
            value={values.customer_name_kana}
            onChange={(e) => onChange("customer_name_kana", e.target.value)}
          />
        </div>

        {/* 郵便番号 */}
        <div>
          <Label>
            郵便番号 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={values.postal_code}
              onChange={(e) =>
                handlePostalCodeChange(e.target.value.replace(/\D/g, ""))
              }
              placeholder="1000001"
              maxLength={7}
              className={errors.postal_code ? "border-red-500" : ""}
            />
            {postalLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                検索中...
              </span>
            )}
          </div>
          {errors.postal_code && (
            <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>
          )}
        </div>

        {/* 都道府県 */}
        <div>
          <Label>
            都道府県 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={values.prefecture}
            onChange={(e) => onChange("prefecture", e.target.value)}
            className={errors.prefecture ? "border-red-500" : ""}
          />
        </div>

        {/* 住所１ */}
        <div className="md:col-span-2">
          <Label>
            住所１ <span className="text-red-500">*</span>
          </Label>
          <Input
            value={values.customer_address1}
            onChange={(e) => onChange("customer_address1", e.target.value)}
            className={errors.customer_address1 ? "border-red-500" : ""}
          />
          {errors.customer_address1 && (
            <p className="text-xs text-red-500 mt-1">
              {errors.customer_address1}
            </p>
          )}
        </div>

        {/* 住所２ */}
        <div className="md:col-span-2">
          <Label>住所２（建物名・部屋番号）</Label>
          <Input
            value={values.customer_address2}
            onChange={(e) => onChange("customer_address2", e.target.value)}
          />
        </div>

        {/* 会社名 */}
        <div>
          <Label>会社名</Label>
          <Input
            value={values.customer_company}
            onChange={(e) => onChange("customer_company", e.target.value)}
          />
        </div>

        {/* 部署名 */}
        <div>
          <Label>部署名</Label>
          <Input
            value={values.customer_department}
            onChange={(e) => onChange("customer_department", e.target.value)}
          />
        </div>

        {/* 電話番号 */}
        <div>
          <Label>電話番号</Label>
          <Input
            value={values.customer_phone}
            onChange={(e) => onChange("customer_phone", e.target.value)}
          />
        </div>

        {/* メールアドレス */}
        <div>
          <Label>メールアドレス</Label>
          <Input
            type="email"
            value={values.customer_email}
            onChange={(e) => onChange("customer_email", e.target.value)}
            className={errors.customer_email ? "border-red-500" : ""}
          />
          {errors.customer_email && (
            <p className="text-xs text-red-500 mt-1">
              {errors.customer_email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
