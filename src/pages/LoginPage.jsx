import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, loginIdToEmail } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { supabase: sb } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!sb) {
      setError('認証機能が設定されていません。管理者にご連絡ください。');
      setLoading(false);
      return;
    }

    const email = loginIdToEmail(loginId.trim().toLowerCase());
    const { error: err } = await sb.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'IDまたはパスワードが正しくありません。' : err.message);
      setLoading(false);
      return;
    }

    navigate('/admin', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-xl">🍽</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Halal Food Maps</h1>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">店舗管理ログイン</h2>
        <p className="text-sm text-slate-500 mb-6">発行されたIDとパスワードでログインしてください</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginId" className="block text-sm font-medium text-slate-700 mb-1">ログインID</label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="例: shibuya-halal-ramen-ouka"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <Link to="/" className="block text-center text-sm text-slate-500 hover:text-emerald-600 mt-6">
          ← マップに戻る
        </Link>
      </div>
    </div>
  );
}
