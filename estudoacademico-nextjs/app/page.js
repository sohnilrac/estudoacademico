'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import MyCollection from './MyCollection';
import NewAlbumForm from './NewAlbumForm';
import Statistics from './Statistics';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('colecao');

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('albums').select('*');
    if (error) {
      setError(error.message);
    } else {
      setAlbums(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  return (
    <div style={{ minHeight: '100vh', background: '#EDE3D0', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#14100D' }}>SONHO</div>
          <div style={{ fontSize: 12, color: '#5A4E3A', fontStyle: 'italic' }}>
            Fichário de Samba — {albums.length} Álbuns Validados
          </div>
        </div>

        {error && (
          <div style={{ background: '#F8D7DA', border: '1px solid #DC3545', borderRadius: 6, padding: 12, fontSize: 12, color: '#721C24', marginBottom: 16 }}>
            Erro ao carregar do Supabase: {error}
            <br />Confira se a tabela <code>albums</code> existe e se as políticas de acesso (RLS) foram criadas.
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid #D8CBA8', paddingBottom: 8 }}>
          <button onClick={() => setTab('colecao')} style={{ background: 'none', border: tab === 'colecao' ? '2px solid #8C2F1B' : 'none', color: tab === 'colecao' ? '#8C2F1B' : '#5A4E3A', cursor: 'pointer', fontSize: 12, padding: '6px 12px', fontWeight: tab === 'colecao' ? 700 : 400 }}>
            📚 Minha Coleção
          </button>
          <button onClick={() => setTab('novo')} style={{ background: 'none', border: tab === 'novo' ? '2px solid #8C2F1B' : 'none', color: tab === 'novo' ? '#8C2F1B' : '#5A4E3A', cursor: 'pointer', fontSize: 12, padding: '6px 12px', fontWeight: tab === 'novo' ? 700 : 400 }}>
            📷 Novo Disco
          </button>
          <button onClick={() => setTab('stats')} style={{ background: 'none', border: tab === 'stats' ? '2px solid #8C2F1B' : 'none', color: tab === 'stats' ? '#8C2F1B' : '#5A4E3A', cursor: 'pointer', fontSize: 12, padding: '6px 12px', fontWeight: tab === 'stats' ? 700 : 400 }}>
            📊 Estatísticas
          </button>
        </div>

        {loading && <div style={{ fontSize: 12, color: '#5A4E3A' }}>Carregando…</div>}

        {!loading && tab === 'colecao' && <MyCollection albums={albums} onRefresh={loadAlbums} />}
        {!loading && tab === 'novo' && <NewAlbumForm onSaved={loadAlbums} />}
        {!loading && tab === 'stats' && <Statistics albums={albums} />}
      </div>
    </div>
  );
}
