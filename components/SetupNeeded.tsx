export default function SetupNeeded() {
  return (
    <div className="auth-wrap">
      <div className="auth-card setup-card">
        <div className="auth-logo">🛠️</div>
        <h1>Almost there</h1>
        <p className="auth-sub">
          Spendwise needs a Supabase project to sync your data. Add your keys to{" "}
          <code>.env.local</code> and restart the dev server.
        </p>
        <ol className="setup-steps">
          <li>
            Create a free project at <strong>supabase.com</strong>.
          </li>
          <li>
            In the Supabase <strong>SQL Editor</strong>, run the contents of{" "}
            <code>supabase/schema.sql</code>.
          </li>
          <li>
            From <strong>Settings → API</strong>, copy the Project URL and the{" "}
            <em>anon public</em> key into <code>.env.local</code>:
            <pre>
NEXT_PUBLIC_SUPABASE_URL=...{"\n"}NEXT_PUBLIC_SUPABASE_ANON_KEY=...
            </pre>
          </li>
          <li>
            Stop and restart <code>npm run dev</code>.
          </li>
        </ol>
        <p className="auth-sub">Full instructions are in the README.</p>
      </div>
    </div>
  );
}
