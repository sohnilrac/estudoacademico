'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import INITIAL_ALBUMS from '../../data/seedAlbums';

function dataURItoBlob(dataURI) {
  const [header, data] = dataURI.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MigratePage() {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(l => [...l, msg]);

  const runMigration = async () => {
    setStatus('running');
    setLog([]);
    try {
      for (const album of INITIAL_ALBUMS) {
        addLog(`→ ${album.artist} — ${album.title}`);
        const uploadedPhotos = [];

        for (const photo of album.photos || []) {
          if (!photo.data || !photo.data.startsWith('data:image')) continue;
          const blob = dataURItoBlob(photo.data);
          const path = `${album.id}/${uid()}-capa.jpg`;
          const { error: upErr } = await supabase.storage.from('covers').upload(path, blob, { contentType: blob.type, upsert: true });
          if (upErr) {
            addLog(`  ✗ erro ao subir capa: ${upErr.message}`);
            continue;
          }
          const { data: pub } = supabase.storage.from('covers').getPublicUrl(path);
          uploadedPhotos.push({ id: uid(), url: pub.publicUrl });
          addLog(`  ✓ capa enviada`);
        }

        const { error: insErr } = await supabase.from('albums').upsert({
          id: album.id,
          title: album.title,
          artist: album.artist,
          code: album.code || '',
          year: album.year || '',
          label: album.label || '',
          tracks: album.tracks || [],
          musicians: album.musicians || [],
          photos: uploadedPhotos,
          fonte: album.fonte || 'foto',
          notes: album.notes || '',
        });
        if (insErr) {
          addLog(`  ✗ erro ao salvar disco: ${insErr.message}`);
        } else {
          addLog(`  ✓ disco salvo no banco`);
        }
      }
      addLog('🎉 Migração concluída!');
      setStatus('done');
    } catch (e) {
      addLog('ERRO GERAL: ' + e.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE3D0', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#14100D', marginBottom: 8 }}>🚚 Migração inicial</div>
        <div style={{ fontSize: 13, color: '#5A4E3A', marginBottom: 20 }}>
          Envia os {INITIAL_ALBUMS.length} discos já catalogados (com faixas, músicos e capas) para o Supabase.
          Use apenas uma vez. Rodar de novo não duplica discos (usa upsert por id), mas pode duplicar fotos no bucket.
        </div>

        <button onClick={runMigration} disabled={status === 'running'}
          style={{ background: status === 'done' ? '#28A745' : '#8C2F1B', color: '#EDE3D0', border: 'none', borderRadius: 6, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: status === 'running' ? 'default' : 'pointer', marginBottom: 16 }}>
          {status === 'running' ? 'Migrando…' : status === 'done' ? '✓ Concluído — rodar de novo' : 'Iniciar migração'}
        </button>

        {log.length > 0 && (
          <div style={{ background: '#1a1a1a', color: '#8fff9e', fontFamily: 'monospace', fontSize: 11, padding: 12, borderRadius: 6, maxHeight: 500, overflowY: 'auto', lineHeight: 1.6 }}>
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <a href="/" style={{ fontSize: 12, color: '#8C2F1B' }}>← voltar pro app</a>
        </div>
      </div>
    </div>
  );
}
