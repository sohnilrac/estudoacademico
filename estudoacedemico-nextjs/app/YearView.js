'use client';
import { useState } from 'react';
import MyCollection from './MyCollection';

// Aba "Por Ano": agrupa os discos pelo ano e mostra quantos há em cada um.
// Tocar no ano abre a lista completa dos discos daquele ano (mesmo cartão da Minha Coleção).
export default function YearView({ albums, onRefresh }) {
  const [open, setOpen] = useState({});

  const groups = {};
  albums.forEach(a => {
    const y = a.year === null || a.year === undefined ? '' : String(a.year).trim();
    const key = /^\d{4}$/.test(y) ? y : 'PENDENTE';
    (groups[key] = groups[key] || []).push(a);
  });

  const years = Object.keys(groups).sort((a, b) => {
    if (a === 'PENDENTE') return 1;
    if (b === 'PENDENTE') return -1;
    return a.localeCompare(b);
  });

  const allOpen = years.length > 0 && years.every(y => open[y]);
  const toggleAll = () => {
    const next = {};
    years.forEach(y => { next[y] = !allOpen; });
    setOpen(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: '#5A4E3A' }}>
          {albums.length} discos em {years.filter(y => y !== 'PENDENTE').length} anos
        </div>
        <button onClick={toggleAll} style={{ background: 'none', border: '1px solid #8C2F1B', color: '#8C2F1B', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
          {allOpen ? 'Fechar todos' : 'Abrir todos'}
        </button>
      </div>

      {years.map(y => {
        const list = groups[y];
        const isOpen = !!open[y];
        return (
          <div key={y} style={{ marginBottom: 10 }}>
            <button
              onClick={() => setOpen({ ...open, [y]: !isOpen })}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F2E7', border: '1px solid #D8CBA8', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: '#14100D' }}>
                {y === 'PENDENTE' ? 'Ano PENDENTE' : y}
              </span>
              <span style={{ fontSize: 13, color: '#5A4E3A' }}>
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
