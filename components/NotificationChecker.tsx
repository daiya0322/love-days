'use client';
import { useEffect } from 'react';
import { checkNotifications, loadNotificationSettings } from '@/lib/notifications';
import type { EventRow, TimeCapsuleRow } from '@/lib/supabase';

interface Props {
  startDate: string;
  events:    EventRow[];
  capsules:  TimeCapsuleRow[];
}

export default function NotificationChecker({ startDate, events, capsules }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settings = loadNotificationSettings();
    if (!settings.enabled) return;

    checkNotifications({
      settings,
      startDate,
      events: events.map(e => ({ id: e.id, title: e.title, date: e.date })),
      capsules: capsules.map(c => ({ id: c.id, title: c.title, openDate: c.open_date, isOpened: c.is_opened })),
    });
  }, [startDate, events, capsules]);

  return null;
}
