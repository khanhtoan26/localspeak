// Home, Topics, History screens

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────
function HomeScreen({ go }) {
  const d = window.LS_DATA;
  return (
    <div style={{ padding: '8px 18px 100px', fontFamily: T.sans }}>
      {/* Greeting */}
      <div style={{ marginTop: 8, marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: T.inkMute, letterSpacing: 0.2 }}>
          Thursday, May 7
        </div>
        <h1 style={{
          fontFamily: T.serif, fontSize: 34, lineHeight: 1.05,
          fontWeight: 400, margin: '6px 0 0', color: T.ink,
          letterSpacing: -0.5,
        }}>
          Good morning,<br/>
          <span style={{ fontStyle: 'italic' }}>{d.user.name}.</span>
        </h1>
      </div>

      {/* Streak strip */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 22,
      }}>
        <Card style={{ flex: 1, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.pauseLex }}>
            {Icon.flame(14, T.pauseLex)}
            <span style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
              Streak
            </span>
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 30, color: T.ink, marginTop: 4, lineHeight: 1 }}>
            {d.user.streak}<span style={{ fontSize: 14, color: T.inkMute }}> days</span>
          </div>
        </Card>
        <Card style={{ flex: 1, padding: 14 }}>
          <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            Last band
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 30, color: T.ink, marginTop: 4, lineHeight: 1 }}>
            {d.user.lastBand.toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>
            target {d.user.targetBand.toFixed(1)}
          </div>
        </Card>
      </div>

      {/* Today's drill — hero card */}
      <SectionLabel>Today's drill</SectionLabel>
      <Card padding={0} style={{
        background: T.ink, color: '#fff',
        border: 'none', overflow: 'hidden', marginBottom: 26,
      }} onClick={() => go('record')}>
        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <Tag color="rgba(255,255,255,0.12)" ink="#fff" style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
              {d.todayDrill.part}
            </Tag>
            <Tag color="rgba(255,255,255,0.12)" ink="rgba(255,255,255,0.85)" style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
              {Icon.clock(11, 'rgba(255,255,255,0.7)')}<span style={{ marginLeft: 4 }}>{d.todayDrill.duration}</span>
            </Tag>
          </div>
          <div style={{
            fontFamily: T.serif, fontSize: 24, lineHeight: 1.2,
            letterSpacing: -0.3,
          }}>
            {d.todayDrill.topic}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 22,
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              Tap to begin recording
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {Icon.mic(20, T.ink)}
            </div>
          </div>
        </div>
      </Card>

      {/* Pause-coach callout — the hero feature for foreigners */}
      <SectionLabel>Your focus this week</SectionLabel>
      <Card style={{
        marginBottom: 26, padding: 16, background: T.beigeSoft, border: 'none',
      }} onClick={() => go('coach')}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {Icon.pause(16, '#fff')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 2 }}>
              Pause Coach
            </div>
            <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>
              You averaged <strong style={{ color: T.ink }}>3 long pauses</strong> per answer.
              Learn bridge phrases to keep your flow.
            </div>
          </div>
          {Icon.chevron(16, T.inkMute)}
        </div>
      </Card>

      {/* Quick start */}
      <SectionLabel action="Browse all" onAction={() => go('topics')}>Quick start</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
        {[
          { p: 'Part 1', q: 'Tell me about your hometown.', m: '30 s' },
          { p: 'Part 2', q: 'Describe a memorable journey.', m: '2 min' },
          { p: 'Part 3', q: 'Why do people travel abroad?', m: '1 min' },
        ].map((row, i) => (
          <Card key={i} padding={14} onClick={() => go('record')} style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 10, fontWeight: 600,
              color: T.inkSoft, letterSpacing: 0.5,
              padding: '4px 7px', background: T.beigeSoft, borderRadius: 6,
              flexShrink: 0,
            }}>{row.p.replace(' ', '·')}</div>
            <div style={{ flex: 1, fontSize: 14, color: T.ink, lineHeight: 1.3 }}>{row.q}</div>
            <div style={{ fontSize: 11, color: T.inkMute, fontFamily: T.mono }}>{row.m}</div>
          </Card>
        ))}
      </div>

      {/* History preview */}
      <SectionLabel action="See all" onAction={() => go('history')}>Recent sessions</SectionLabel>
      <Card padding={0}>
        {d.history.slice(0, 3).map((row, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 16px',
            borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.3 }}>{row.topic}</div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2, fontFamily: T.mono }}>
                {row.date} · {row.dur}
              </div>
            </div>
            <div style={{
              fontFamily: T.serif, fontSize: 20, color: T.ink,
            }}>{row.band.toFixed(1)}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOPICS
// ─────────────────────────────────────────────
function TopicsScreen({ go, back }) {
  const [tab, setTab] = React.useState('Part 2');
  const d = window.LS_DATA;
  return (
    <div style={{ padding: '8px 18px 100px', fontFamily: T.sans }}>
      <div onClick={back} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        color: T.inkSoft, fontSize: 14, marginTop: 4, marginBottom: 12, cursor: 'pointer',
      }}>{Icon.back(18, T.inkSoft)} Home</div>

      <h1 style={{
        fontFamily: T.serif, fontSize: 32, fontWeight: 400, margin: '0 0 6px',
        letterSpacing: -0.4, color: T.ink,
      }}>Choose a topic</h1>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 20 }}>
        Real IELTS-style cue cards from the 2024–25 question bank.
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: 4,
        background: T.beigeSoft, borderRadius: 12, marginBottom: 18,
      }}>
        {['Part 1', 'Part 2', 'Part 3'].map(p => (
          <div key={p} onClick={() => setTab(p)} style={{
            flex: 1, textAlign: 'center', padding: '8px 0',
            fontSize: 13, fontWeight: tab === p ? 600 : 500,
            color: tab === p ? T.ink : T.inkSoft,
            background: tab === p ? '#fff' : 'transparent',
            borderRadius: 9, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>{p}</div>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {d.topics[tab].map((t, i) => (
          <Card key={i} padding={16} onClick={() => go('record')} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Tag color={T.beigeSoft}>{t.tag}</Tag>
                {t.hot && <Tag color="#fdf2eb" ink={T.pauseLex}>Trending</Tag>}
              </div>
              <div style={{ fontSize: 15, color: T.ink, lineHeight: 1.35, fontWeight: 500 }}>
                {t.q}
              </div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 6, fontFamily: T.mono }}>
                ~{t.mins} min
              </div>
            </div>
            {Icon.chevron(16, T.inkMute)}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────
function HistoryScreen({ go, back }) {
  const d = window.LS_DATA;
  return (
    <div style={{ padding: '8px 18px 100px', fontFamily: T.sans }}>
      <div onClick={back} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        color: T.inkSoft, fontSize: 14, marginTop: 4, marginBottom: 12, cursor: 'pointer',
      }}>{Icon.back(18, T.inkSoft)} Home</div>

      <h1 style={{
        fontFamily: T.serif, fontSize: 32, fontWeight: 400, margin: '0 0 6px',
        letterSpacing: -0.4, color: T.ink,
      }}>Your progress</h1>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 22 }}>
        {d.user.sessionsThisWeek} sessions this week.
      </div>

      {/* Trend chart — simple */}
      <Card style={{ marginBottom: 22, padding: 18 }}>
        <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
          Band trend · last 7 sessions
        </div>
        <svg viewBox="0 0 280 90" width="100%" height="90" style={{ display: 'block' }}>
          {/* gridlines */}
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" y1={i * 28 + 4} x2="280" y2={i * 28 + 4}
              stroke={T.line} strokeDasharray="2 4"/>
          ))}
          {/* trend line */}
          {(() => {
            const pts = [5.5, 6.0, 5.5, 6.5, 6.0, 7.0, 6.5];
            const xStep = 280 / (pts.length - 1);
            const yFor = v => 88 - ((v - 5) / 4) * 80;
            const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * xStep} ${yFor(v)}`).join(' ');
            return (
              <>
                <path d={path} fill="none" stroke={T.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((v, i) => (
                  <circle key={i} cx={i * xStep} cy={yFor(v)} r={i === pts.length - 1 ? 4 : 2.5}
                    fill={i === pts.length - 1 ? T.pauseLex : T.ink}/>
                ))}
              </>
            );
          })()}
        </svg>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: T.mono, fontSize: 9, color: T.inkMute, marginTop: 6,
        }}>
          <span>Apr 30</span><span>May 7</span>
        </div>
      </Card>

      <SectionLabel>All sessions</SectionLabel>
      <Card padding={0}>
        {d.history.map((row, i, arr) => (
          <div key={i} onClick={() => go('feedback')} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', cursor: 'pointer',
            borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.3 }}>{row.topic}</div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 3, fontFamily: T.mono }}>
                {row.date} · {row.dur}
              </div>
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, marginRight: 4 }}>
              {row.band.toFixed(1)}
            </div>
            {Icon.chevron(14, T.inkMute)}
          </div>
        ))}
      </Card>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.TopicsScreen = TopicsScreen;
window.HistoryScreen = HistoryScreen;
