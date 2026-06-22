import { createClient } from '@supabase/supabase-js';

export type CoupleRow = {
  id: string;
  invite_code: string;
  start_date: string;
  partner1_name: string;
  partner2_name: string;
  partner1_id: string;
  partner2_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PhotoRow = {
  id: string;
  couple_id: string;
  storage_path: string;
  caption: string | null;
  uploaded_by: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  couple_id: string;
  text: string;
  from_name: string;
  author_id: string;
  created_at: string;
};

export type TimeCapsuleRow = {
  id: string;
  couple_id: string;
  title: string;
  open_date: string;
  is_opened: boolean;
  created_by: string;
  created_at: string;
};

export type CapsuleMsgRow = {
  id: string;
  capsule_id: string;
  author_id: string;
  author_name: string;
  message_text: string | null;
  photo_storage_path: string | null;
  is_sealed: boolean;
  sealed_at: string | null;
  created_at: string;
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath);
  return data.publicUrl;
}
