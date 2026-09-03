'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const uid = () => Math.random().toString(36).slice(2, 10);
const blankTrack = (side) => ({ id: uid(), side, number: 1, title: '', composers: [''] });
const blankMusician = () => ({ id: uid(), name: '', instrument: '' });

export default function NewAlbumForm({ onSaved }) {
  const [form, setForm] = useState({
    title: '', artist: '', code: '', year: '', label: '',
    tracks: [blankTrack('a')],
    musicians: [blankMusician()],
    notes: '',
  });
  const [photos, setPhotos] = useState([]); // File objects, ainda não enviados
  const [saving, setSaving] = useState(false);

  const updateTrack = (id, field, value) => {
    setForm(f => ({ ...f, tracks: f.tracks.map(t => t.id === id ? { ...t, [field]: value } : t) }));
  };
  const updateComposer = (trackId, idx, value) => {
    setForm(f => ({
      ...f,
      tracks: f.tracks.map(t => t.id === trackId
        ? { ...t, composers: t.composers.map((c, i) => i === idx ? value : c) }
        : t)
    }));
  };
  const addComposer = (trackId) => {
    setForm(f => ({ ...f, tracks: f.tracks.map(t => t.id === trackId ? { ...t, composers: [...t.composers, ''] } : t) }));
  };
  const addTrack = (side) => {
    const nextNum = form.tracks.filter(t => t.side === side).length + 1;
    setForm(f => ({ ...f, tracks: [...f.tracks, { ...blankTrack(side), number: nextNum }] }));
  };
  const removeTrack = (id) => setForm(f => ({ ...f, tracks: f.tracks.filter(t => t.id !== id) }));

  const updateMusician = (id, field, value) => {
    setForm(f => ({ ...f, musicians: f.musicians.map(m => m.id === id ? { ...m, [field]: value } : m) }));
  };
  const addMusician = () => setForm(f => ({ ...f, musicians: [...f.musicians, blankMusician()] }));
  const removeMusician = (id) => setForm(f => ({ ...f, musicians: f.musicians.filter(m => m.id !== id) }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.artist.trim()) {
      alert('Preencha pelo menos título e artista.');
      return;
    }
    setSaving(true);
    try {
      const newId = 'a' + uid();
      const uploadedPhotos = [];
      for (const file of photos) {
        const path = `${newId}/${uid()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('covers').upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('covers').getPublicUrl(path);
        uploadedPhotos.push({ id: uid(), url: pub.publicUrl });
      }

      const cleanTracks = form.tracks
        .filter(t => t.title.trim())
        .map(t => ({ ...t, composers: t.composers.filter(c => c.trim()) }));
      const cleanMusicians = form.musicians.filter(m => m.name.trim());

      const { error: insErr } = await supabase.from('albums').insert({
        id: newId,
        title: form.title.trim(),
        artist: form.artist.trim(),
        code: form.code.trim(),
        year: form.year.trim(),
        label: form.label.trim(),
        tracks: cleanTracks,
        musicians: cleanMusicians,
        photos: uploadedPhotos,
        fonte: 'foto',
        notes: form.notes.trim(),
      });
      if (insErr) throw insErr;

      setForm({ title: '', artist: '', code: '', year: '', label: '', tracks: [blankTrack('a')], musicians: [blankMusician()], notes: '' });
      setPhotos([]);
      onSaved();
      alert('Disco salvo!');
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #D8CBA8', borderRadius: 4, background: '#fff', marginBottom: 8, boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#5A4E3A', marginBottom: 2, display: 'block' };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ fontSize: 11, color: '#5A4E3A', marginBottom: 16, fontStyle: 'italic' }}>
        Cadastro manual — preencha só o que estiver confirmado nas fotos do disco. Deixe em branco o que não tiver certeza (não invente dados).
      </div>

      <label style={labelStyle}>Título do disco *</label>
      <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

      <label style={labelStyle}>Artista *</label>
      <input style={inputStyle} value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} />

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Código CFSR</label>
          <input style={inputStyle} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="ex: CFSR0071 (deixe vazio se não tiver)" />
        </div>
        <div style={{ width: 100 }}>
          <label style={labelStyle}>Ano</label>
          <input style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
        </div>
      </div>

      <label style={labelStyle}>Gravadora/Selo</label>
      <input style={inputStyle} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />

      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 16, marginBottom: 8 }}>Faixas</div>
      {['a', 'b'].map(side => (
        <div key={side} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#5A4E3A', textTransform: 'uppercase', marginBottom: 4 }}>Lado {side.toUpperCase()}</div>
          {form.tracks.filter(t => t.side === side).map(t => (
            <div key={t.id} style={{ background: '#F7F2E7', border: '1px solid #D8CBA8', borderRadius: 4, padding: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <input type="number" style={{ ...inputStyle, width: 50, marginBottom: 0 }} value={t.number} onChange={e => updateTrack(t.id, 'number', parseInt(e.target.value) || 1)} />
                <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Título da faixa" value={t.title} onChange={e => updateTrack(t.id, 'title', e.target.value)} />
                <button onClick={() => removeTrack(t.id)} style={{ background: 'none', border: 'none', color: '#8C2F1B', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
              {t.composers.map((c, i) => (
                <input key={i} style={{ ...inputStyle, marginBottom: 4, fontSize: 11 }} placeholder="Compositor" value={c} onChange={e => updateComposer(t.id, i, e.target.value)} />
              ))}
              <button onClick={() => addComposer(t.id)} style={{ fontSize: 10, background: 'none', border: 'none', color: '#8C2F1B', cursor: 'pointer' }}>+ compositor</button>
            </div>
          ))}
          <button onClick={() => addTrack(side)} style={{ fontSize: 11, background: 'none', border: '1px dashed #D8CBA8', borderRadius: 4, padding: '4px 10px', color: '#5A4E3A', cursor: 'pointer' }}>+ faixa no lado {side.toUpperCase()}</button>
        </div>
      ))}

      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 16, marginBottom: 8 }}>Músicos</div>
      {form.musicians.map(m => (
        <div key={m.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Nome" value={m.name} onChange={e => updateMusician(m.id, 'name', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="Instrumento" value={m.instrument} onChange={e => updateMusician(m.id, 'instrument', e.target.value)} />
          <button onClick={() => removeMusician(m.id)} style={{ background: 'none', border: 'none', color: '#8C2F1B', cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>
      ))}
      <button onClick={addMusician} style={{ fontSize: 11, background: 'none', border: '1px dashed #D8CBA8', borderRadius: 4, padding: '4px 10px', color: '#5A4E3A', cursor: 'pointer' }}>+ músico</button>

      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 16, marginBottom: 4 }}>Notas / Ficha técnica</div>
      <textarea style={{ ...inputStyle, minHeight: 80 }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 16, marginBottom: 4 }}>Fotos do disco</div>
      <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files || []))} style={{ fontSize: 12, marginBottom: 8 }} />
      {photos.length > 0 && <div style={{ fontSize: 11, color: '#5A4E3A', marginBottom: 8 }}>{photos.length} foto(s) selecionada(s)</div>}

      <button onClick={handleSave} disabled={saving}
        style={{ background: '#8C2F1B', color: '#EDE3D0', border: 'none', borderRadius: 4, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', marginTop: 12 }}>
        {saving ? 'Salvando...' : 'Salvar Disco'}
      </button>
    </div>
  );
}
