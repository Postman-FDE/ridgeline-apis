import { services } from '@/lib/catalog.mjs';

const players = [
  ['P-1001', 'NJ', 'active'],
  ['P-1002', 'PA', 'active, close to daily limit'],
  ['P-1003', 'MI', 'self-excluded'],
  ['P-1004', 'NY', 'active (no casino in state)'],
  ['P-1005', 'NJ', 'cool-off'],
];

export default function Home() {
  return (
    <main>
      <span className="badge">Sandbox · fictional data</span>
      <h1>Ridgeline API Sandbox</h1>
      <p className="lede">
        Six small HTTP APIs for a fictional sportsbook and casino. Each API has its own owner, its own OpenAPI spec and
        its own bearer key, so you can test discovery, contracts and credential governance for AI agents.
      </p>
      <div className="note">
        Every player, market and amount here is invented. Amounts are integer minor units (cents): <code>1000</code> = $10.00.
      </div>

      <h2>APIs</h2>
      <div className="grid">
        {services.map((s) => (
          <section className="card" key={s.name}>
            <h3>{s.title}</h3>
            <div className="owner">Owner: {s.owner}</div>
            <p>{s.description.replace(/\*\*/g, '').replace(/`/g, '')}</p>
            {s.endpoints.map((e) => (
              <div className="ep" key={e.method + e.path}>
                <span className="method">{e.method}</span>
                <span>/{s.name}{e.path}</span>
              </div>
            ))}
            <div className="links">
              <a href={`/specs/${s.name}.openapi.json`}>OpenAPI spec</a>
              <a href={`/postman/${s.name}.postman_collection.json`}>Postman collection</a>
            </div>
          </section>
        ))}
      </div>

      <h2>Authentication</h2>
      <p>
        Every request needs <code>Authorization: Bearer &lt;key&gt;</code>, with the key for that API. A key for one API
        is rejected by the others. Keys are never handed out directly. Request access and receive a credential reference
        that a secure access proxy resolves at call time. A reference that reaches the API unresolved returns{' '}
        <code>401 unresolved_reference</code>.
      </p>
      <pre>{`curl -X POST https://<this-host>/player-limits/v1/eligibility/check \\
  -H 'Authorization: Bearer {{vault:RIDGELINE_PLAYER_LIMITS_KEY}}' \\
  -H 'Content-Type: application/json' \\
  -d '{"player_id":"P-1003","product":"sportsbook"}'`}</pre>

      <h2>Sandbox players</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Player</th><th>State</th><th>Status</th></tr>
          </thead>
          <tbody>
            {players.map(([id, st, status]) => (
              <tr key={id}><td className="mono">{id}</td><td>{st}</td><td>{status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Downloads</h2>
      <p>
        <a href="/postman/e2e-championship-boost.postman_collection.json">End-to-end flow collection</a> ·{' '}
        <a href="/postman/sportsbook-app-contract.postman_collection.json">Consumer contract collection</a> ·{' '}
        <a href="/postman/sandbox.postman_environment.json">Environment</a> ·{' '}
        <a href="/specs/history/bets.v1.openapi.json">bets v1 spec (deprecated)</a> · <a href="/healthz">Health</a>
      </p>

      <footer>Ridgeline is a fictional company. This sandbox exists for demos and testing only.</footer>
    </main>
  );
}
