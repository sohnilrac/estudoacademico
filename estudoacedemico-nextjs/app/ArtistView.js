'use client';
import { useState } from 'react';
import MyCollection from './MyCollection';

// Aba "Por Artista": agrupa os discos pelo nome do artista (como está cadastrado),
// em ordem alfabética, com o total de cada um. Tocar no artista abre os discos dele,
// ordenados por ano (mesmo cartão da Minha Coleção).
export default function ArtistView({ albums, onRefresh }) {
  const [open, setOpen] = useState({});
  const [busca, setBusca] = useState('');

  const groups = {};
  albums.forEach(a => {
    const name = (a.artist || '').trim() || 'Artista PENDENTE';
    (groups[name] = groups[name] || []).push(a);
  });

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const artists = Object.keys(groups)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .filter(n => !busca.trim() || norm(n).includes(norm(busca.trim())));

  const allOpen = artists.length > 0 && artists.every(n => open[n]);
  const toggleAll = () => {
    const next = { ...open };
    artists.forEach(n => { next[n] = !allOpen; });
    setOpen(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: '#5A4E3A' }}>
          {albums.length} discos de {Object.keys(groups).length} artistas
        </div>
        <button onClick={toggleAll} style={{ background: 'none', border: '1px solid #8C2F1B', color: '#8C2F1B', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
          {allOpen ? 'Fechar todos' : 'Abrir todos'}
        </button>
      </div>

      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar artista…"
        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 14, border: '1px solid #D8CBA8', borderRadius: 6, background: '#F7F2E7', color: '#14100D', marginBottom: 14 }}
      />

      {artists.length === 0 && (
        <div style={{ fontSize: 12, color: '#5A4E3A' }}>Nenhum artista encontrado.</div>
      )}

      {artists.map(n => {
        const list = groups[n];
        const isOpen = !!open[n];
        return (
          <div key={n} style={{ marginBottom: 10 }}>
            <button
              onClick={() => setOpen({ ...open, [n]: !isOpen })}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: '#F7F2E7', border: '1px solid #D8CBA8', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#14100D' }}>{n}</span>
              <span style={{ fontSize: 13, color: '#5A4E3A', whiteSpace: 'nowrap' }}>
                {list.length} disco{list.length !== 1 ? 's' : ''} {isOpen ? '▼' : '▶'}
              </span>
            </button>
            {isOpen && (
              <div style={{ marginTop: 10, paddingLeft: 8, borderLeft: '3px solid #D8CBA8' }}>
                <MyCollection albums={list} onRefresh={onRefresh} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
