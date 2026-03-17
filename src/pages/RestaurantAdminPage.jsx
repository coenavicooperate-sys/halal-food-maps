import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAreaById, getRestaurantBySlug, getSlugFromName } from '../data/areas';
import { useAuth } from '../contexts/AuthContext';

const EDITABLE_FIELDS = [
  { key: 'description', label: '店舗説明', type: 'textarea', rows: 4 },
  { key: 'hours', label: '営業時間', type: 'text', placeholder: '例: 11:00 - 22:00' },
  { key: 'phone', label: '電話番号', type: 'tel', placeholder: '例: 03-1234-5678' },
  { key: 'address', label: '住所', type: 'text' },
  { key: 'reservationUrl', label: '予約URL', type: 'url', placeholder: 'https://...' },
  { key: 'menuBookUrl', label: 'メニューURL', type: 'url', placeholder: 'https://...' },
  { key: 'payment', label: '支払い方法（カンマ区切り）', type: 'text', placeholder: 'Cash, Credit Card, QR Pay' },
  { key: 'wifi', label: 'Wi-Fi', type: 'checkbox' },
  { key: 'parking', label: '駐車場', type: 'checkbox' },
];

export function RestaurantAdminPage() {
  const navigate = useNavigate();
  const { user, loginId, isAuthenticated, loading: authLoading, supabase } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loginId) return;
    const parts = loginId.split('-');
    if (parts.length < 2) return;
    const area = parts[0];
    const slug = parts.slice(1).join('-');
    const areaData = getAreaById(area);
    const rest = getRestaurantBySlug(area, slug);
    if (rest) {
      setRestaurant(rest);
      setAreaId(area);
      setFormData({
        description: rest.description || '',
        hours: rest.hours || '',
        phone: rest.phone || '',
        address: rest.address || '',
        reservationUrl: rest.reservationUrl || '',
        menuBookUrl: rest.menuBookUrl || '',
        payment: Array.isArray(rest.payment) ? rest.payment.join(', ') : (rest.payment || ''),
        wifi: rest.wifi ?? false,
        parking: rest.parking ?? false,
      });
    }
  }, [loginId]);

  useEffect(() => {
    if (!supabase || !restaurant || !areaId) return;
    const slug = getSlugFromName(restaurant.name);
    supabase
      .from('restaurant_edits')
      .select('*')
      .eq('area_id', areaId)
      .eq('restaurant_slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data.edits,
            payment: data.edits?.payment ? (Array.isArray(data.edits.payment) ? data.edits.payment.join(', ') : data.edits.payment) : prev.payment,
          }));
        }
      })
      .catch(() => {});
  }, [supabase, restaurant, areaId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase || !restaurant || !areaId) return;
    setSaving(true);
    setSaveMessage('');

    const slug = getSlugFromName(restaurant.name);
    const edits = {
      ...formData,
      payment: formData.payment ? formData.payment.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    const { error } = await supabase.from('restaurant_edits').upsert(
      {
        area_id: areaId,
        restaurant_slug: slug,
        edits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'area_id,restaurant_slug' }
    );

    if (error) {
      setSaveMessage('保存に失敗しました: ' + error.message);
    } else {
      setSaveMessage('保存しました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (authLoading || (!restaurant && loginId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-4">店舗が見つかりません</h1>
        <p className="text-slate-600 mb-4">ログインIDが正しいかご確認ください。</p>
        <Link to="/login" className="text-emerald-600 hover:underline">← ログインに戻る</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white">🍽</span>
            </div>
            <h1 className="font-bold text-slate-800">店舗情報編集</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/${areaId}/${getSlugFromName(restaurant.name)}`}
              className="text-sm text-emerald-600 hover:underline"
            >
              公開ページ
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">{restaurant.name}</h2>
          <p className="text-sm text-slate-500">以下の項目を編集できます。保存すると公開ページに反映されます。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {EDITABLE_FIELDS.map(({ key, label, type, placeholder, rows }) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-4">
              <label htmlFor={key} className="block text-sm font-medium text-slate-700 mb-2">
                {label}
              </label>
              {type === 'textarea' ? (
                <textarea
                  id={key}
                  value={formData[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={rows || 3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={placeholder}
                />
              ) : type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600">あり</span>
                </label>
              ) : (
                <input
                  id={key}
                  type={type}
                  value={formData[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}

          {saveMessage && (
            <p className={`text-sm px-4 py-2 rounded-lg ${saveMessage.includes('失敗') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {saveMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Halal Food Maps 店舗管理
        </p>
      </main>
    </div>
  );
}
