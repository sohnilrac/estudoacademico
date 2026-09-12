'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { compressImage, withTimeout } from '../lib/compressImage';

const TRACKED_MUSICIANS = [
  { name: 'Gordinho ⭐' }, { name: 'Luizão' }, { name: 'Wilson das Neves' },
  { name: 'Luna' }, { name: 'Eliseu' }, { name: 'Marçal' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MyCollection({ albums, onRefresh }) {
  const [expanded, setExpanded] = useState({});
  const [uploading, setUploading] = useState({});

  const sorted = [...albums].sort((a, b) => (a.year || '9999').localeCompare(b.year || '9999'));

  const handleAddPhoto = async (albumId, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    setUploading(u => ({ ...u, [albumId]: true }));
    try {
      const album = albums.find(a => a.id === albumId);
      const newPhotos = [];
      for (const file of fileList) {
        const compressed = await compressImage(file);
        const path = `${albumId}/${uid()}-foto.jpg`;
        const { error: upErr } = await withTimeout(
          supabase.storage.from('covers').upload(path, compressed, { contentType: 'image/jpeg' }),
          30000,
          'enviar foto'
        );
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('covers').getPublicUrl(path);
        newPhotos.push({ id: uid(), url: pub.publicUrl });
      }
      const updatedPhotos = [...(album.photos || []), ...newPhotos];
      const { error: updErr } = await withTimeout(
        supabase.from('albums').update({ photos: updatedPhotos }).eq('id', albumId),
        15000,
        'salvar no banco'
      );
      if (updErr) throw updErr;
      onRefresh();
    } catch (e) {
      alert('Erro ao anexar foto: ' + e.message);
    } finally {
      setUploading(u => ({ ...u, [albumId]: false }));
    }
  };

  const handleRemovePhoto = async (albumId, photoId) => {
    const album = albums.find(a => a.id === albumId);
    const updatedPhotos = (album.photos || []).filter(p => p.id !== photoId);
    const { error } = await supabase.from('albums').update({ photos: updatedPhotos }).eq('id', albumId);
    if (error) { alert('Erro: ' + error.message); return; }
    onRefresh();
  };

  const handleDelete = async (albumId) => {
    if (!confirm('Remover este disco da coleção? Isso não apaga as fotos do Storage.')) return;
    const { error } = await supabase.from('albums').delete().eq('id', albumId);
    if (error) { alert('Erro: ' + error.message); return; }
    onRefresh();
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: '#5A4E3A', marginBottom: 16 }}>
        {albums.length} discos catalogados · ordenado por ano (mais antigo primeiro)
      </div>

      {sorted.map(album => {
        const albumMusicians = (album.musicians || []).map(m => m.name);
        const trackedInAlbum = TRACKED_MUSICIANS.filter(t =>
          albumMusicians.some(m => m.replace(' ⭐', '').trim() === t.name.replace(' ⭐', '').trim())
        );

        return (
          <div key={album.id} style={{ background: '#F7F2E7', border: '1px solid #D8CBA8', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 0 }}>
                {album.photos?.[0] ? (
                  <img src={album.photos[0].url} alt="Capa" loading="lazy"
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid #D8CBA8' }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 4, flexShrink: 0, background: '#EDE3D0', border: '1px solid #D8CBA8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💿</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#14100D' }}>{album.artist} — {album.title}</div>
                  <div style={{ fontSize: 11, color: '#5A4E3A', marginTop: 2 }}>{album.year}{album.code ? ` · ${album.code}` : ''}</div>
                  <div style={{ fontSize: 9, marginTop: 4, display: 'inline-block', padding: '2px 6px', borderRadius: 3, background: album.fonte === 'foto' ? '#D4EDDA' : '#FFF3CD', color: album.fonte === 'foto' ? '#1B5E20' : '#856404', border: `1px solid ${album.fonte === 'foto' ? '#28A745' : '#FFC107'}` }}>
                    {album.fonte === 'foto' ? '📷 fonte: foto' : '⚠️ fonte: não verificada'}
                  </div>
                  {' '}
                  <span style={{ fontSize: 9, color: '#5A4E3A' }}>{trackedInAlbum.length}/6 🎵 | {(album.photos || []).length} 📸</span>
                </div>
              </div>
              <button onClick={() => setExpanded({ ...expanded, [album.id]: !expanded[album.id] })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                {expanded[album.id] ? '▼' : '▶'}
              </button>
            </div>

            {expanded[album.id] && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #D8CBA8', fontSize: 12, color: '#14100D' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Faixas ({(album.tracks || []).length})</div>
                {['a', 'b'].map(side => (
                  <div key={side} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: '#5A4E3A', textTransform: 'uppercase' }}>Lado {side.toUpperCase()}</div>
                    {(album.tracks || []).filter(t => t.side === side).sort((x, y) => x.number - y.number).map(t => (
                      <div key={t.id} style={{ fontSize: 11, marginLeft: 8 }}>
                        {t.number}. {t.title} — <span style={{ color: '#5A4E3A' }}>{(t.composers || []).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}>Músicos ({(album.musicians || []).length})</div>
                {(album.musicians || []).map(m => (
                  <div key={m.id} style={{ fontSize: 11, marginLeft: 8 }}>{m.name} — <span style={{ color: '#5A4E3A' }}>{m.instrument}</span></div>
                ))}

                {album.notes && (
                  <>
                    <div style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}>Notas</div>
                    <div style={{ fontSize: 10, color: '#5A4E3A', lineHeight: 1.5 }}>{album.notes}</div>
                  </>
                )}

                <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 4 }}>Fotos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(album.photos || []).map(p => (
                    <div key={p.id} style={{ position: 'relative' }}>
                      <img src={p.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid #D8CBA8' }} />
                      <button onClick={() => handleRemovePhoto(album.id, p.id)} style={{ position: 'absolute', top: -6, right: -6, background: '#8C2F1B', color: '#EDE3D0', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10 }}>×</button>
                    </div>
                  ))}
                </div>
                <label style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#8C2F1B', cursor: 'pointer' }}>
                  {uploading[album.id] ? 'Enviando...' : '📎 Anexar foto'}
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => handleAddPhoto(album.id, e.target.files)} disabled={uploading[album.id]} />
                </label>

                <div style={{ marginTop: 12 }}>
                  <button onClick={() => handleDelete(album.id)} style={{ background: 'none', border: '1px solid #8C2F1B', color: '#8C2F1B', borderRadius: 4, padding: '4px 10px', fontSize: 10, cursor: 'pointer' }}>
                    🗑 Remover disco
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
