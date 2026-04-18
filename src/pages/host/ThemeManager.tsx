import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import type { Theme, ThemeItem } from '../../types';

const EMPTY_ITEM: ThemeItem = { word: '', clue: '' };

function ItemRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ThemeItem;
  index: number;
  onChange: (i: number, field: keyof ThemeItem, val: string) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <span style={{ color: '#8A89A0', fontWeight: 700, minWidth: 24, fontSize: 13 }}>
        {index + 1}.
      </span>
      <input
        placeholder="Word (e.g. Moon)"
        value={item.word}
        onChange={(e) => onChange(index, 'word', e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Clue (e.g. Earth's natural satellite)"
        value={item.clue}
        onChange={(e) => onChange(index, 'clue', e.target.value)}
        style={{ ...inputStyle, flex: 2 }}
      />
      <button
        onClick={() => onRemove(index)}
        style={{
          background: '#FF4B4B22',
          border: '1px solid #FF4B4B55',
          color: '#FF4B4B',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        ×
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: '#0B0D1A',
  border: '1px solid #2A2F52',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#E8E6F0',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'Nunito, sans-serif',
  outline: 'none',
  minHeight: 44,
};

export default function ThemeManager() {
  const navigate = useNavigate();
  const { themes, loading, createTheme, deleteTheme, seedDefaultThemes, updateTheme } = useThemes();
  const [showForm, setShowForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formItems, setFormItems] = useState<ThemeItem[]>([
    ...Array(16).fill(null).map(() => ({ ...EMPTY_ITEM })),
  ]);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  function handleItemChange(i: number, field: keyof ThemeItem, val: string) {
    setFormItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function handleItemRemove(i: number) {
    if (formItems.length <= 16) return;
    setFormItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleOpenEdit(theme: Theme) {
    setEditingTheme(theme);
    setFormName(theme.name);
    setFormDesc(theme.description ?? '');
    setFormItems(theme.items.map((it) => ({ ...it })));
    setError('');
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTheme(null);
    setFormName('');
    setFormDesc('');
    setFormItems(Array(16).fill(null).map(() => ({ ...EMPTY_ITEM })));
    setError('');
  }

  async function handleSave() {
    setError('');
    const filled = formItems.filter((it) => it.word.trim() && it.clue.trim());
    if (!formName.trim()) { setError('Theme name is required.'); return; }
    if (filled.length < 16) { setError('You need at least 16 filled items.'); return; }
    setSaving(true);
    if (editingTheme) {
      await updateTheme(editingTheme.id, filled, formName, formDesc);
    } else {
      await createTheme({ name: formName, description: formDesc, items: filled, createdAt: Date.now() });
    }
    setSaving(false);
    handleCloseForm();
  }

  async function handleSeed() {
    setSeeding(true);
    await seedDefaultThemes();
    setSeeding(false);
  }

  function startSession(theme: Theme) {
    navigate(`/host/lobby/${theme.id}`);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#8A89A0', cursor: 'pointer', fontSize: 22 }}
          >
            ←
          </button>
          <h1 style={{ fontWeight: 900, fontSize: 32, color: '#E8E6F0', margin: 0 }}>
            🎯 Themes
          </h1>
          <div style={{ flex: 1 }} />
          {themes.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn-3d"
              style={{
                background: '#CE82FF',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '10px 18px',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 0 #8a44cc',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {seeding ? 'Loading...' : '✨ Load Default Themes'}
            </button>
          )}
          <button
            onClick={() => { setEditingTheme(null); setShowForm(true); }}
            className="btn-3d"
            style={{
              background: '#1CB0F6',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #0a7ab8',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            + New Theme
          </button>
        </div>

        {/* Theme List */}
        {loading ? (
          <p style={{ color: '#8A89A0', textAlign: 'center', fontSize: 18 }}>Loading themes...</p>
        ) : themes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A89A0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>No themes yet. Load defaults or create one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="card"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#E8E6F0' }}>{theme.name}</div>
                  {theme.description && (
                    <div style={{ color: '#8A89A0', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                      {theme.description}
                    </div>
                  )}
                  <div style={{
                    display: 'inline-block',
                    marginTop: 8,
                    background: '#1CB0F622',
                    border: '1px solid #1CB0F644',
                    color: '#1CB0F6',
                    borderRadius: 8,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                  }}>
                    {theme.items.length} items
                  </div>
                </div>
                <button
                  onClick={() => startSession(theme)}
                  className="btn-3d"
                  style={{
                    background: '#58CC02',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 20px',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #3a8800',
                    fontFamily: 'Nunito, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ▶ Start Session
                </button>
                <button
                  onClick={() => handleOpenEdit(theme)}
                  style={{
                    background: '#FFC80022',
                    border: '1px solid #FFC80055',
                    color: '#FFC800',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTheme(theme.id)}
                  style={{
                    background: '#FF4B4B22',
                    border: '1px solid #FF4B4B55',
                    color: '#FF4B4B',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '24px 16px', zIndex: 100, overflowY: 'auto',
          }}>
            <div className="card animate-fade-scale" style={{ width: '100%', maxWidth: 680, padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: '#E8E6F0' }}>{editingTheme ? '✏️ Edit Theme' : 'Create New Theme'}</h2>
                <div style={{ flex: 1 }} />
                <button
                  onClick={handleCloseForm}
                  style={{ background: 'none', border: 'none', color: '#8A89A0', cursor: 'pointer', fontSize: 24 }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Theme Name *
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Space English"
                  style={{ ...inputStyle, width: '100%', marginTop: 6 }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Description (optional)
                </label>
                <input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Short description"
                  style={{ ...inputStyle, width: '100%', marginTop: 6 }}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Items ({formItems.length}) — minimum 16
                </label>
              </div>

              <div style={{ maxHeight: 360, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
                {formItems.map((item, i) => (
                  <ItemRow
                    key={i}
                    item={item}
                    index={i}
                    onChange={handleItemChange}
                    onRemove={handleItemRemove}
                  />
                ))}
              </div>

              <button
                onClick={() => setFormItems((prev) => [...prev, { ...EMPTY_ITEM }])}
                style={{
                  background: '#2A2F52',
                  border: '1px solid #3a4066',
                  color: '#8A89A0',
                  borderRadius: 10,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 20,
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                + Add Item
              </button>

              {error && (
                <p style={{ color: '#FF4B4B', fontWeight: 700, marginBottom: 12 }}>{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-3d"
                style={{
                  background: '#1CB0F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px 32px',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 5px 0 #0a7ab8',
                  width: '100%',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                {saving ? 'Saving...' : editingTheme ? '💾 Save Changes' : '💾 Save Theme'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
