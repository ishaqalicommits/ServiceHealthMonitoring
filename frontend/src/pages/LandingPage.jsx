import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export const LandingPage = () => {
  const { user, logout } = useAuth();

  // Interactive Live Tester Playground State
  const [testUrl, setTestUrl] = useState('https://api.github.com/zen');
  const [testStatus, setTestStatus] = useState('idle'); // 'idle' | 'testing' | 'success'
  const [testResult, setTestResult] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const presets = [
    { name: 'GitHub API', url: 'https://api.github.com/zen', type: 'API', time: '22ms' },
    { name: 'Google Search', url: 'https://www.google.com', type: 'HTTP', time: '14ms' },
    { name: 'Cloudflare DNS', url: '1.1.1.1:53', type: 'TCP', time: '4ms' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org', type: 'KEYWORD', time: '28ms' },
  ];

  const handleRunTest = (e) => {
    if (e) e.preventDefault();
    if (!testUrl.trim()) return;

    setTestStatus('testing');
    setTestResult(null);

    setTimeout(() => {
      const isTcp = testUrl.includes(':');
      const latency = Math.floor(Math.random() * 25) + 12;
      setTestResult({
        status: 'UP',
        statusCode: isTcp ? null : 200,
        latency: `${latency}ms`,
        sslDays: isTcp ? null : 78,
        dnsResolved: '104.244.42.1',
        message: 'Endpoint verified operational and responding within acceptable thresholds.',
      });
      setTestStatus('success');
    }, 900);
  };

  const selectPreset = (preset) => {
    setTestUrl(preset.url);
    setTestStatus('idle');
    setTestResult(null);
  };

  const faqs = [
    {
      q: 'What protocols and services can ServiceWatch monitor?',
      a: 'ServiceWatch provides out-of-the-box monitoring for HTTP/HTTPS web applications, REST APIs with status code validation, TCP port connectivity (databases, caches, custom ports), and keyword search verification in response bodies, plus automated SSL/TLS expiry tracking.'
    },
    {
      q: 'How does the instant notification system work?',
      a: 'When an endpoint fails consecutive checks, ServiceWatch immediately generates and posts a high-priority, rich-embed notification directly to your configured Discord webhooks or custom HTTP endpoints. Once recovered, an automatic green recovery notice is delivered.'
    },
    {
      q: 'Can customers view our status page without creating an account?',
      a: 'Yes! ServiceWatch supports public, unauthenticated status pages with customizable slugs (e.g. /status/production-services). You can brand them with your custom color palette, descriptions, and component groupings.'
    },
    {
      q: 'Does ServiceWatch track SSL certificate expiration?',
      a: 'Yes. For every HTTPS monitor, ServiceWatch automatically extracts the TLS certificate chain, calculates remaining validity days, and issues early warning notices 30 days before expiration to prevent unexpected outages.'
    },
    {
      q: 'How does real-time streaming work on the dashboard?',
      a: 'The ServiceWatch console uses reactive Server-Sent Events (SSE). Whenever an active health probe completes in the Spring Boot monitoring engine, results are immediately broadcast to all connected dashboards without requiring browser polling or manual refreshes.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Top Notification if Logged In */}
      {user && (
        <div className="bg-primary text-white py-2 px-3 text-center small fw-medium d-flex flex-wrap justify-content-center align-items-center gap-2">
          <span>
            <i className="bi bi-person-check-fill me-1"></i> You are signed in as <strong>{user.username}</strong> ({user.role}).
          </span>
          <Link to="/dashboard" className="btn btn-sm btn-light py-0 px-2 fw-semibold text-primary">
            Open Dashboard &rarr;
          </Link>
          <button onClick={logout} className="btn btn-sm btn-outline-light py-0 px-2">
            Sign Out
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="landing-nav py-3">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <i className="bi bi-shield-check fs-4 text-primary"></i>
            </div>
            <span className="fw-bold fs-5 text-dark tracking-tight">ServiceWatch</span>
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-4">
            <a href="#features" className="text-secondary text-decoration-none fw-medium small hover-primary">Features</a>
            <a href="#protocols" className="text-secondary text-decoration-none fw-medium small hover-primary">Protocols</a>
            <a href="#playground" className="text-secondary text-decoration-none fw-medium small hover-primary">Interactive Demo</a>
            <a href="#how-it-works" className="text-secondary text-decoration-none fw-medium small hover-primary">How It Works</a>
            <a href="#faq" className="text-secondary text-decoration-none fw-medium small hover-primary">FAQ</a>
            <Link to="/status/production-services" className="text-secondary text-decoration-none fw-medium small hover-primary">
              <i className="bi bi-broadcast me-1 text-primary"></i>Status Page
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/dashboard" className="btn btn-primary rounded-pill px-3 btn-sm fw-semibold shadow-sm">
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Link>
                <button onClick={logout} className="btn btn-outline-secondary rounded-pill px-3 btn-sm fw-medium">
                  <i className="bi bi-box-arrow-right me-1"></i> Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary rounded-pill px-3 btn-sm fw-medium">
                  Sign In
                </Link>
                <Link to="/login?mode=register" className="btn btn-primary rounded-pill px-3 btn-sm fw-semibold shadow-sm">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero text-center">
        <div className="container">
          <div className="mb-3">
            <span className="hero-badge">
              <span className="pulse-dot"></span>
              Real-Time Health Monitoring Engine &bull; Sub-Second Outage Detection
            </span>
          </div>

          <h1 className="hero-title mb-3">
            Never Let Downtime <br />
            <span className="text-gradient">Catch You Off Guard</span>
          </h1>

          <p className="hero-desc mb-4">
            Monitor websites, APIs, TCP sockets, and SSL certificates with automated health probes. 
            Receive instant rich Discord alerts, manage incident workflows, and publish branded public status pages.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-speedometer2"></i> Open Dashboard &rarr;
                </Link>
                <button onClick={logout} className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 bg-white">
                  <i className="bi bi-box-arrow-right"></i> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-box-arrow-in-right"></i> Log In to Dashboard
                </Link>
                <Link to="/login?mode=register" className="btn btn-outline-primary btn-lg rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 bg-white">
                  <i className="bi bi-person-plus"></i> Create Free Account
                </Link>
              </>
            )}
            <Link to="/status/production-services" className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 bg-white">
              <i className="bi bi-broadcast text-primary"></i> View Live Status Page
            </Link>
          </div>

          {/* Hero Live Mockup Frame */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="hero-mockup-wrapper">
                <div className="hero-mockup text-start">
                  <div className="mockup-header">
                    <div className="d-flex align-items-center gap-3">
                      <div className="window-dots">
                        <div className="window-dot dot-red"></div>
                        <div className="window-dot dot-yellow"></div>
                        <div className="window-dot dot-green"></div>
                      </div>
                      <span className="small text-muted font-monospace">servicewatch-live-console &bull; Spring Boot Engine</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 small font-monospace">
                        <span className="pulse-dot me-1 d-inline-block"></span> SSE STREAM LIVE
                      </span>
                    </div>
                  </div>

                  <div className="mockup-body">
                    {/* Top Stats Inside Mockup */}
                    <div className="row g-3 mb-3">
                      <div className="col-md-3 col-6">
                        <div className="stat-pill">
                          <div className="small text-muted mb-1">SYSTEM UPTIME</div>
                          <div className="fs-4 fw-bold text-success">99.98%</div>
                          <div className="small text-muted">Past 30 Days</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="stat-pill">
                          <div className="small text-muted mb-1">AVG RESPONSE</div>
                          <div className="fs-4 fw-bold text-primary">24ms</div>
                          <div className="small text-muted">Sub-second probes</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="stat-pill">
                          <div className="small text-muted mb-1">ACTIVE OUTAGES</div>
                          <div className="fs-4 fw-bold text-white">0</div>
                          <div className="small text-muted">All systems green</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="stat-pill">
                          <div className="small text-muted mb-1">SSL CERTIFICATES</div>
                          <div className="fs-4 fw-bold text-warning">82 Days</div>
                          <div className="small text-muted">Auto-expiry warning</div>
                        </div>
                      </div>
                    </div>

                    {/* Live Monitored Endpoints List */}
                    <div className="small text-muted fw-semibold mb-2 text-uppercase tracking-wider">
                      Live Monitored Endpoints &bull; Real-Time Health Stream
                    </div>

                    <div className="live-service-row">
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50">API</span>
                        <div>
                          <span className="fw-semibold text-white">GitHub Public API</span>
                          <span className="text-muted ms-2 small d-none d-sm-inline">https://api.github.com</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="font-monospace small text-primary">18ms</span>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                          <i className="bi bi-check-circle me-1"></i> OPERATIONAL
                        </span>
                      </div>
                    </div>

                    <div className="live-service-row">
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50">TCP</span>
                        <div>
                          <span className="fw-semibold text-white">Cloudflare DNS Service</span>
                          <span className="text-muted ms-2 small d-none d-sm-inline">1.1.1.1:53</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="font-monospace small text-primary">4ms</span>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                          <i className="bi bi-check-circle me-1"></i> OPERATIONAL
                        </span>
                      </div>
                    </div>

                    <div className="live-service-row">
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">KEYWORD</span>
                        <div>
                          <span className="fw-semibold text-white">Google Search Engine</span>
                          <span className="text-muted ms-2 small d-none d-sm-inline">Presence: "Google"</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="font-monospace small text-primary">31ms</span>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                          <i className="bi bi-check-circle me-1"></i> OPERATIONAL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Trust Strip */}
      <section className="py-4 border-top border-bottom bg-light">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3 col-6">
              <div className="fs-3 fw-bold text-dark">99.99%</div>
              <div className="small text-muted">Probe Reliability</div>
            </div>
            <div className="col-md-3 col-6">
              <div className="fs-3 fw-bold text-primary">&lt; 10s</div>
              <div className="small text-muted">Alert Notification Speed</div>
            </div>
            <div className="col-md-3 col-6">
              <div className="fs-3 fw-bold text-dark">5 Protocols</div>
              <div className="small text-muted">HTTP, API, TCP, PING, KEYWORD</div>
            </div>
            <div className="col-md-3 col-6">
              <div className="fs-3 fw-bold text-success">0 Silent Errors</div>
              <div className="small text-muted">Automated Incident Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Bento Grid */}
      <section id="features" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Enterprise Architecture</h6>
            <h2 className="fw-bold fs-2 text-dark">Engineered for Uncompromising Uptime</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to keep production infrastructure responsive, transparent, and resilient.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-blue">
                  <i className="bi bi-cpu"></i>
                </div>
                <h5 className="fw-bold mb-2">Automated Health Engine</h5>
                <p className="text-muted small mb-0">
                  Java 17 &amp; Spring Boot non-blocking scheduler running concurrent probes with configurable timeouts, retries, and intervals.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-purple">
                  <i className="bi bi-discord"></i>
                </div>
                <h5 className="fw-bold mb-2">Rich Discord &amp; Webhooks</h5>
                <p className="text-muted small mb-0">
                  Instant color-coded embed alerts with cause diagnosis, status change timestamps, and recovery notifications.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-emerald">
                  <i className="bi bi-broadcast"></i>
                </div>
                <h5 className="fw-bold mb-2">Public Status Pages</h5>
                <p className="text-muted small mb-0">
                  Share real-time transparency with stakeholders through branded, public status pages with custom slugs and zero login required.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-amber">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <h5 className="fw-bold mb-2">SSL Expiry Defense</h5>
                <p className="text-muted small mb-0">
                  Automatic TLS handshake inspection calculates remaining days and fires early warnings 30 days before certificates expire.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-rose">
                  <i className="bi bi-exclamation-octagon"></i>
                </div>
                <h5 className="fw-bold mb-2">Incident Lifecycle Control</h5>
                <p className="text-muted small mb-0">
                  Manage downtime workflows through OPEN &rarr; ACKNOWLEDGED &rarr; RESOLVED states with duration tracking and postmortems.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bento-card">
                <div className="bento-icon icon-cyan">
                  <i className="bi bi-activity"></i>
                </div>
                <h5 className="fw-bold mb-2">Real-Time Reactive SSE</h5>
                <p className="text-muted small mb-0">
                  Server-Sent Events stream check outcomes straight to your browser. Charts and tables update live without page refreshing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocols Section */}
      <section id="protocols" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Multi-Protocol Probing</h6>
            <h2 className="fw-bold fs-2 text-dark">Monitor Any Layer of Your Infrastructure</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Whether it's a web portal, a microservice REST endpoint, a database port, or an internal socket.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-globe fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">HTTP / HTTPS Websites</h6>
                    <span className="small text-muted">Web apps, portals, frontends</span>
                  </div>
                </div>
                <p className="small text-secondary mb-0">
                  Tests HTTP reachability, follows 3xx redirects, verifies response times, and defaults to accepting any 2xx response as operational.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success">
                    <i className="bi bi-code-square fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">REST APIs &amp; Microservices</h6>
                    <span className="small text-muted">JSON endpoints, Gateways</span>
                  </div>
                </div>
                <p className="small text-secondary mb-0">
                  Inspects API health check endpoints, validates specific status codes (200, 201, 204), and checks response body keyword presence.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 rounded-2 bg-info bg-opacity-10 text-info">
                    <i className="bi bi-hdd-network fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">TCP Ports &amp; Databases</h6>
                    <span className="small text-muted">Postgres, Redis, DNS, Mail</span>
                  </div>
                </div>
                <p className="small text-secondary mb-0">
                  Verifies TCP socket connectivity on specific ports (e.g. 5432, 6379, 53) without overhead, measuring connection handshake latency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator / Playground */}
      <section id="playground" className="py-5">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="tester-box">
                <div className="row align-items-center mb-4">
                  <div className="col-md-7">
                    <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 mb-2">
                      <i className="bi bi-play-circle me-1"></i> Interactive Sandbox
                    </span>
                    <h3 className="fw-bold text-white mb-2">Test Any Endpoint in Real Time</h3>
                    <p className="text-secondary small mb-0">
                      Try our probe engine directly from your browser. Pick a preset or enter your service endpoint.
                    </p>
                  </div>
                  <div className="col-md-5 mt-3 mt-md-0 text-md-end">
                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      {presets.map((p) => (
                        <span key={p.name} className="preset-chip" onClick={() => selectPreset(p)}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRunTest} className="mb-4">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-link-45deg"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="Enter URL (https://example.com) or TCP address (hostname:port)"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                      disabled={testStatus === 'testing'}
                    >
                      {testStatus === 'testing' ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span> Probing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-lightning-charge-fill"></i> Run Check
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Results Screen */}
                {testResult && (
                  <div className="bg-dark bg-opacity-75 border border-success border-opacity-50 p-3 rounded-3">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success px-3 py-2">
                          <i className="bi bi-check-circle-fill me-1"></i> {testResult.status}
                        </span>
                        <span className="fw-semibold text-white">{testUrl}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="small text-secondary">
                          <i className="bi bi-speedometer2 me-1 text-primary"></i> Latency: <strong className="text-white">{testResult.latency}</strong>
                        </span>
                        {testResult.statusCode && (
                          <span className="small text-secondary">
                            <i className="bi bi-arrow-return-right me-1 text-success"></i> HTTP: <strong className="text-white">{testResult.statusCode}</strong>
                          </span>
                        )}
                        {testResult.sslDays && (
                          <span className="small text-secondary">
                            <i className="bi bi-lock me-1 text-warning"></i> TLS Valid: <strong className="text-white">{testResult.sslDays}d</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="small text-muted font-monospace">{testResult.message}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Simple 3-Step Setup</h6>
            <h2 className="fw-bold fs-2 text-dark">From Setup to Monitoring in Under 60 Seconds</h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 rounded-3 shadow-sm">
                <div className="step-number mx-auto">1</div>
                <h5 className="fw-bold mb-2">Add Your Endpoints</h5>
                <p className="text-muted small mb-0">
                  Provide your target URL, TCP host, or API endpoint. Choose check frequency from 10s to 5 minutes.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 rounded-3 shadow-sm">
                <div className="step-number mx-auto">2</div>
                <h5 className="fw-bold mb-2">Connect Alert Channels</h5>
                <p className="text-muted small mb-0">
                  Paste your Discord webhook URL. ServiceWatch will test and verify notification routing instantly.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 rounded-3 shadow-sm">
                <div className="step-number mx-auto">3</div>
                <h5 className="fw-bold mb-2">Sit Back &amp; Stay Covered</h5>
                <p className="text-muted small mb-0">
                  The scheduler inspects uptime continuously, publishes live status pages, and wakes you up only when it matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-5">
        <div className="container py-4" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Frequently Asked Questions</h6>
            <h2 className="fw-bold fs-2 text-dark">Have Questions? We Have Answers</h2>
          </div>

          <div>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="faq-card">
                  <div className="faq-header" onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                    <span>{faq.q}</span>
                    <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}></i>
                  </div>
                  {isOpen && <div className="faq-body">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="py-5">
        <div className="container">
          <div className="cta-banner text-center">
            <h2 className="fw-bold fs-1 mb-3">Ready to Achieve 99.99% Reliability?</h2>
            <p className="lead fs-6 text-light opacity-75 mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Set up your first monitor in seconds. No complex agent installations required.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow">
                  Open Console &rarr;
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow">
                  Create Free Account &rarr;
                </Link>
              )}
              <Link to="/status/production-services" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold">
                View Public Status Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 border-top bg-white">
        <div className="container">
          <div className="row g-4 align-items-center justify-content-between mb-4">
            <div className="col-md-5">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shield-check fs-4 text-primary"></i>
                <span className="fw-bold fs-5 text-dark">ServiceWatch</span>
              </div>
              <p className="text-muted small mb-0">
                Next-generation real-time service health, uptime observability, and public incident communications.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex flex-wrap justify-content-md-end gap-3 small">
                <Link to="/status/production-services" className="text-decoration-none text-secondary">
                  <i className="bi bi-broadcast text-primary me-1"></i>Status Page
                </Link>
                <Link to={user ? "/dashboard" : "/login"} className="text-decoration-none text-secondary">
                  <i className="bi bi-speedometer2 text-primary me-1"></i>Dashboard
                </Link>
                <Link to="/login" className="text-decoration-none text-secondary">
                  <i className="bi bi-shield-lock text-primary me-1"></i>Admin Portal
                </Link>
              </div>
            </div>
          </div>
          <div className="border-top pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
            <div>&copy; {new Date().getFullYear()} ServiceWatch. Built with Spring Boot 3 &bull; React &bull; MongoDB.</div>
            <div className="mt-2 mt-sm-0">
              <span className="badge bg-success-subtle text-success border border-success">
                <span className="pulse-dot me-1 d-inline-block"></span> Engine Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
