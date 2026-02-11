"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DRAFT_KEY = "kikite_order_draft";
const SAVE_DELAY = 500;

export interface DraftData {
  customer: {
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
  paymentMethod: string;
  discount: number;
  orderMemo: string;
  details: any[];
  savedAt: string;
}

function isEmpty(draft: DraftData): boolean {
  const c = draft.customer;
  const hasCustomer =
    c.customer_name || c.customer_phone || c.postal_code || c.customer_address1;
  const hasDetails = draft.details.length > 0;
  const hasMemo = draft.orderMemo;
  return !hasCustomer && !hasDetails && !hasMemo;
}

export function useDraftOrder() {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // マウント後にlocalStorageをチェック
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft: DraftData = JSON.parse(raw);
        if (!isEmpty(draft)) {
          setHasDraft(true);
          setDraftSavedAt(draft.savedAt);
        }
      }
    } catch {
      // 壊れたデータは無視
    }
    setChecked(true);
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft: DraftData = JSON.parse(raw);
      return isEmpty(draft) ? null : draft;
    } catch {
      return null;
    }
  }, []);

  const saveDraft = useCallback((data: Omit<DraftData, "savedAt">) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const draft: DraftData = {
          ...data,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setDraftSavedAt(draft.savedAt);
      } catch {
        // localStorage full等は無視
      }
    }, SAVE_DELAY);
  }, []);

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftSavedAt(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { hasDraft, draftSavedAt, checked, loadDraft, saveDraft, clearDraft };
}
