'use client';

const TRACKED_MUSICIANS = [
  { name: 'Gordinho ⭐' }, { name: 'Luizão' }, { name: 'Wilson das Neves' },
  { name: 'Luna' }, { name: 'Eliseu' }, { name: 'Marçal' },
];

export default function Statistics({ albums }) {
  // Compositores mais recorrentes
  const composerCounts = {};
  albums.forEach(a => (a.tracks || []).forEach(t => (t.composers || []).forEach(c => {
    const name = c.trim();
    if (!name) return;
    composerCounts[name] = (composerCounts[name] || 0) + 1;
  })));
  const topComposers = Object.entries(composerCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);

  // Músicos mais recorrentes
  const musicianCounts = {};
  albums.forEach(a => (a.musicians || []).forEach(m => {
    if (!m.name) return;
    musicianCounts[m.name] = (musicianCounts[m.name] || 0) + 1;
  }));
  const topMusicians = Object.entries(musicianCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const allMusiciansAZ = Object.entries(musicianCounts).sort((a, b) => a[0].localeCompare(b[0]));

  // MeuTime — quantos discos têm cada um, e quantos discos têm os 6 completos
  const meuTimeCounts = TRACKED_MUSICIANS.map(t => {
    const cleanName = t.name.replace(' ⭐', '').trim();
    const count = albums.filter(a => (a.musicians || []).some(m => m.name.replace(' ⭐', '').trim() === cleanName)).length;
    return { name: cleanName, count };
  });
  const albumsWithFullMeuTime = albums.filter(a => {
    const musicians = (a.musicians || []).map(m => m.name);
    const tracked = TRACKED_MUSICIANS.filter(t => musicians.some(m => m.replace(' ⭐', '').trim() === t.name.replace(' ⭐', '').trim()));
    return tracked.length === 6;
  });

  // Produção — Rildo Hora
  const rildoAlbums = albums
    .filter(a => (a.production_credits || []).some(p => p.name?.replace(' ⭐', '').trim() === 'Rildo Hora'))
    .map(a => ({
      title: a.title,
      year: a.year,
      roles: (a.production_credits || [])
        .filter(p => p.name?.replace(' ⭐', '').trim() === 'Rildo Hora')
        .map(p => p.role)
        .join(', ')
    }))
    .sort((a, b) => (a.year || '').localeCompare(b.year || ''));

  const sectionStyle = { background: '#F7F2E7', border: '1px solid #D8CBA8', borderRadius: 8, padding: 16, marginBottom: 16 };
  const titleStyle = { fontSize: 14, fontWeight: 700, color: '#14100D', marginBottom: 10 };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🎵 MeuTime — aparições por músico</div>
        {meuTimeCounts.map(m => (
          <div key={m.name} style={{ fontSize: 12, color: '#5A4E3A', marginBottom: 4 }}>
            {m.name}{m.name === 'Gordinho' ? ' ⭐' : ''}: {m.count} disco{m.count !== 1 ? 's' : ''}
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#8C2F1B', marginTop: 8, fontWeight: 700 }}>
          {albumsWithFullMeuTime.length} disco(s) com os 6 do MeuTime juntos
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Top Compositores</div>
        {topComposers.map(([name, count], i) => (
          <div key={name} style={{ fontSize: 11, color: '#5A4E3A', marginBottom: 4 }}>
            {i + 1}. {name} ({count} faixa{count !== 1 ? 's' : ''})
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Top Músicos</div>
        {topMusicians.map(([name, count], i) => {
          const isTracked = TRACKED_MUSICIANS.some(t => name.replace(' ⭐', '').trim() === t.name.replace(' ⭐', '').trim());
          const displayName = name.replace(' ⭐', '').trim();
          return (
            <div key={name} style={{ fontSize: 11, color: '#5A4E3A', marginBottom: 4 }}>
              {i + 1}. {displayName}{isTracked ? ' ⭐' : ''} ({count} disco{count !== 1 ? 's' : ''})
            </div>
          );
        })}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Todos os Músicos Catalogados ({allMusiciansAZ.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 4 }}>
          {allMusiciansAZ.map(([name, count]) => {
            const isTracked = TRACKED_MUSICIANS.some(t => name.replace(' ⭐', '').trim() === t.name.replace(' ⭐', '').trim());
            const displayName = name.replace(' ⭐', '').trim();
            return (
              <div key={name} style={{ fontSize: 10, color: '#5A4E3A' }}>
                {displayName}{isTracked ? ' ⭐' : ''} ({count})
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>🎬 Produção — Rildo Hora</div>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          Rildo Hora ⭐: {rildoAlbums.length} disco{rildoAlbums.length !== 1 ? 's' : ''}
        </div>
        {rildoAlbums.map((a, i) => (
          <div key={i} style={{ fontSize: 11, color: '#5A4E3A', marginBottom: 4 }}>
            {a.title} {a.year ? `(${a.year})` : ''} — {a.roles}
          </div>
        ))}
      </div>
    </div>
  );
}
