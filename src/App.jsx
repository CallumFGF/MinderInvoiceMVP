import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Settings from './Settings';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard'); // Controls what page we see

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Success! Please check your email for a verification link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-sm bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold mb-4">
              {authMode === 'login' ? 'Childminder Login' : 'Create Account'}
            </h2>
            <form onSubmit={handleAuth}>
              <fieldset className="fieldset">
                <label className="fieldset-label">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="fieldset-label mt-4">Password</label>
                <input
                  type="password"
                  className="input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="btn btn-primary mt-6 w-full"
                  disabled={loading}
                >
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </fieldset>
            </form>
            <div className="divider">OR</div>
            <button
              className="btn btn-ghost w-full"
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
              }
            >
              {authMode === 'login' ? 'Create a new account' : 'Back to login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP (PROTECTED) ---
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="navbar bg-base-100 shadow-md px-4 sm:px-8">
        <div className="flex-1">
          <span className="text-xl font-bold text-primary">
            Childminder Pro
          </span>
        </div>
        <div className="flex-none gap-2">
          <button
            className={`btn ${
              currentView === 'dashboard' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`btn ${
              currentView === 'settings' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
          <button
            className="btn btn-outline btn-error ml-2 sm:ml-4"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-4 sm:p-8">
        {currentView === 'dashboard' && (
          <div className="card bg-base-100 shadow-xl max-w-md mx-auto text-center mt-10">
            <div className="card-body">
              <h1 className="text-3xl font-bold text-success mb-2">
                Welcome Back!
              </h1>
              <p className="text-base-content/70">
                Click on 'Settings' in the top right to set up your profile.
              </p>
            </div>
          </div>
        )}

        {currentView === 'settings' && <Settings session={session} />}
      </div>
    </div>
  );
}
