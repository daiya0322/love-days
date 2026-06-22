'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/auth'); return; }

      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .or(`partner1_id.eq.${session.user.id},partner2_id.eq.${session.user.id}`)
        .maybeSingle();

      router.replace(couple ? '/home' : '/auth/setup');
    });
  }, [router]);

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--bd2)', borderTopColor:'var(--accent)', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
