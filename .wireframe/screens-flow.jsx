// Recording, Feedback, Pause Coach screens

// ─────────────────────────────────────────────
// RECORD
// ─────────────────────────────────────────────
function RecordScreen({ go, back }) {
  const [phase, setPhase] = React.useState('prep'); // prep | recording | done
  const [t, setT] = React.useState(0);
  const [pauseFlash, setPauseFlash] = React.useState(false);
  const [livePause, setLivePause] = React.useState(0);
  const d = window.LS_DATA;
  const cue = d.cueCard;

  React.useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setT(x => x + 0.1), 100);
    return () => clearInterval(id);
  }, [phase]);

  // Simulate live pause detection: every ~6s, flash a pause warning
  React.useEffect(() => {
    if (phase !== 'recording') return;
    const tick = Math.floor(t * 10);
    // flash at certain marks
    if ([35, 90, 130, 185].includes(tick)) {
      setPauseFlash(true);
      setLivePause(p => p + 1);
      setTimeout(() => setPauseFlash(false), 1400);
    }
  }, [t, phase]);

  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60);
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  // Animated waveform (random heights, but stable per-tick)
  const bars = Array.from({ length: 32 }, (_, i) => {
    const seed = Math.sin((t * 4) + i * 0.7) * 0.5 + 0.5;
    const noise = Math.sin((t * 7.3) + i * 2.1) * 0.3 + 0.7;
    return phase === 'recording' ? Math.max(0.15, seed * noise) : 0.2;
  });

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      fontFamily: T.sans, background: phase === 'recording' ? '#161513' : T.bg,
      color: phase === 'recording' ? '#fff' : T.ink,
      transition: 'background 0.4s, color 0.4s',
    }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 18px 0',
      }}>
        <div onClick={back} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: phase === 'recording' ? 'rgba(255,255,255,0.7)' : T.inkSoft,
          fontSize: 14, cursor: 'pointer',
        }}>{Icon.back(18, 'currentColor')} Cancel</div>
        <Tag color={phase === 'recording' ? 'rgba(255,255,255,0.12)' : T.beigeSoft}
          ink={phase === 'recording' ? '#fff' : T.ink}>
          Part 2 · Cue card
        </Tag>
      </div>

      {/* cue card */}
      <div style={{ padding: '18px 18px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: T.serif, fontSize: 22, lineHeight: 1.25, letterSpacing: -0.3,
          marginBottom: 14,
        }}>
          {cue.main}
        </div>
        <div style={{
          padding: 14, borderRadius: 14,
          background: phase === 'recording' ? 'rgba(255,255,255,0.06)' : T.beigeSoft,
          border: phase === 'recording' ? '1px solid rgba(255,255,255,0.08)' : 'none',
          marginBottom: 18,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 600,
            color: phase === 'recording' ? 'rgba(255,255,255,0.55)' : T.inkMute,
            marginBottom: 8,
          }}>You should say</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cue.bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.4 }}>
                <span style={{ opacity: 0.5 }}>—</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* live pause indicator */}
        {phase === 'recording' && (
          <div style={{
            padding: 14, borderRadius: 14,
            background: pauseFlash ? 'rgba(217,119,87,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${pauseFlash ? 'rgba(217,119,87,0.5)' : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.25s',
            marginBottom: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: pauseFlash ? T.pauseLex : 'rgba(255,255,255,0.3)',
                boxShadow: pauseFlash ? `0 0 0 6px rgba(217,119,87,0.25)` : 'none',
                transition: 'all 0.25s',
              }}/>
              <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                {pauseFlash ? (
                  <span style={{ color: T.pauseLex, fontWeight: 600 }}>Long pause detected — try a bridge phrase</span>
                ) : (
                  <span>Live pause monitor · <span style={{ fontFamily: T.mono }}>{livePause}</span> caught</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* timer + waveform */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              fontFamily: T.mono, fontSize: 44,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: -1,
              color: phase === 'recording' ? '#fff' : T.ink,
            }}>{timeStr}</div>
            <div style={{
              fontSize: 11, color: phase === 'recording' ? 'rgba(255,255,255,0.5)' : T.inkMute,
              letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, marginTop: 2,
            }}>
              {phase === 'prep' ? 'Ready' : phase === 'recording' ? 'Recording' : 'Stopped'}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 3, height: 56, marginBottom: 22,
          }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                width: 3,
                height: `${h * 100}%`,
                background: phase === 'recording' ? '#fff' : T.inkMute,
                opacity: phase === 'recording' ? 0.9 : 0.35,
                borderRadius: 2,
                transition: 'height 0.1s',
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* big mic button */}
      <div style={{ padding: '0 18px 30px', display: 'flex', justifyContent: 'center' }}>
        {phase !== 'recording' ? (
          <div onClick={() => { setT(0); setLivePause(0); setPhase('recording'); }} style={{
            width: 84, height: 84, borderRadius: '50%',
            background: T.ink, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)', cursor: 'pointer',
          }}>
            {Icon.mic(28, '#fff')}
          </div>
        ) : (
          <div onClick={() => go('feedback')} style={{
            width: 84, height: 84, borderRadius: '50%',
            background: '#fff', color: T.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4), 0 0 0 8px rgba(255,255,255,0.08)',
            cursor: 'pointer',
            position: 'relative',
          }}>
            {Icon.stop(26, T.ink)}
            {/* pulsing ring */}
            <div style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: `2px solid ${T.pauseLex}`,
              opacity: 0.5,
              animation: 'pulse 1.6s ease-out infinite',
            }}/>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// FEEDBACK — the hero report
// ─────────────────────────────────────────────
function FeedbackScreen({ go, back }) {
  const d = window.LS_DATA;
  const s = d.scores;
  const [tab, setTab] = React.useState('pauses'); // pauses | transcript | scores

  const pauses = d.transcript.filter(x => x.type === 'pause');
  const totalDur = s.totalDuration;
  const pauseColors = {
    natural: T.pauseShort, lexical: T.pauseLex,
    thinking: T.pauseThink, grammar: T.pauseGram,
  };

  return (
    <div style={{ padding: '8px 0 100px', fontFamily: T.sans }}>
      <div style={{ padding: '0 18px' }}>
        <div onClick={back} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: T.inkSoft, fontSize: 14, marginTop: 4, marginBottom: 12, cursor: 'pointer',
        }}>{Icon.back(18, T.inkSoft)} Home</div>

        <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 600 }}>
          Session report
        </div>
        <h1 style={{
          fontFamily: T.serif, fontSize: 26, fontWeight: 400, margin: '4px 0 18px',
          letterSpacing: -0.3, color: T.ink, lineHeight: 1.2,
        }}>
          Describe a place you<br/>like to visit.
        </h1>

        {/* Score hero */}
        <Card style={{ padding: 20, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ScoreRing value={s.overall} label="Band" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                Estimated band
              </div>
              <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, marginTop: 4, lineHeight: 1.2, fontStyle: 'italic' }}>
                Competent user
              </div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
                You're <strong>1.0 below</strong> your target. Pause control is your biggest lever.
              </div>
            </div>
          </div>
          {/* sub-scores */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
            marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.line}`,
          }}>
            {[
              ['Fluency', s.fluency],
              ['Lexical', s.lexical],
              ['Grammar', s.grammar],
              ['Pronun.', s.pronunciation],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, lineHeight: 1 }}>
                  {v.toFixed(1)}
                </div>
                <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, letterSpacing: 0.5 }}>{k}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{
          display: 'flex', gap: 6, padding: 4,
          background: T.beigeSoft, borderRadius: 12,
        }}>
          {[['pauses', 'Pauses'], ['transcript', 'Transcript'], ['scores', 'Scores']].map(([k, label]) => (
            <div key={k} onClick={() => setTab(k)} style={{
              flex: 1, textAlign: 'center', padding: '8px 0',
              fontSize: 13, fontWeight: tab === k ? 600 : 500,
              color: tab === k ? T.ink : T.inkSoft,
              background: tab === k ? '#fff' : 'transparent',
              borderRadius: 9, cursor: 'pointer',
            }}>{label}</div>
          ))}
        </div>
      </div>

      {tab === 'pauses' && (
        <div style={{ padding: '0 18px' }}>
          {/* Pause timeline — the hero viz */}
          <Card style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                Pause timeline
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.inkSoft }}>
                {totalDur.toFixed(0)}s
              </div>
            </div>

            <div style={{
              position: 'relative', height: 50,
              background: T.beigeSoft, borderRadius: 8,
              overflow: 'hidden',
            }}>
              {/* tick marks */}
              {[0, 0.25, 0.5, 0.75, 1].map(p => (
                <div key={p} style={{
                  position: 'absolute', left: `${p * 100}%`, top: 0, bottom: 0,
                  width: 1, background: 'rgba(0,0,0,0.05)',
                }}/>
              ))}
              {/* baseline waveform - subtle */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                height: 1, background: T.line,
              }}/>
              {/* pause bars */}
              {pauses.map((p, i) => {
                const left = (p.t / totalDur) * 100;
                const width = Math.max(1, (p.dur / totalDur) * 100);
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${left}%`, top: 4, bottom: 4,
                    width: `${width}%`,
                    background: pauseColors[p.kind],
                    borderRadius: 3,
                    opacity: p.kind === 'natural' ? 0.5 : 0.95,
                  }} title={p.note || p.kind}/>
                );
              })}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: T.mono, fontSize: 9, color: T.inkMute, marginTop: 4,
            }}>
              <span>0:00</span><span>0:11</span><span>0:23</span>
            </div>

            {/* legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
              {[
                ['lexical', 'Lexical gap'],
                ['thinking', 'Thinking'],
                ['grammar', 'Grammar'],
                ['natural', 'Natural'],
              ].map(([k, label]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.inkSoft }}>
                  <PauseDot kind={k}/>{label}
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <Card padding={12}>
              <div style={{ fontFamily: T.serif, fontSize: 24, color: T.ink, lineHeight: 1 }}>{s.longPauses}</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, letterSpacing: 0.4 }}>Long pauses</div>
            </Card>
            <Card padding={12}>
              <div style={{ fontFamily: T.serif, fontSize: 24, color: T.ink, lineHeight: 1 }}>{s.fillerCount}</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, letterSpacing: 0.4 }}>Fillers</div>
            </Card>
            <Card padding={12}>
              <div style={{ fontFamily: T.serif, fontSize: 24, color: T.ink, lineHeight: 1 }}>{s.wpm}</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, letterSpacing: 0.4 }}>WPM</div>
            </Card>
          </div>

          {/* Pause details list */}
          <SectionLabel>Each long pause, explained</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pauses.filter(p => p.dur >= 1.2).map((p, i) => (
              <Card key={i} padding={14} onClick={() => go('coach')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 5 }}><PauseDot kind={p.kind} size={10}/></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, textTransform: 'capitalize' }}>
                        {p.kind} pause
                      </span>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.inkMute }}>
                        {p.dur.toFixed(1)}s · @{p.t.toFixed(1)}s
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}>
                      {p.note}
                    </div>
                  </div>
                  {Icon.chevron(14, T.inkMute)}
                </div>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <Btn onClick={() => go('coach')}>
              Practice bridge phrases →
            </Btn>
          </div>
        </div>
      )}

      {tab === 'transcript' && (
        <div style={{ padding: '0 18px' }}>
          <Card style={{ padding: 18, marginBottom: 16 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 17, lineHeight: 1.7, color: T.ink,
              letterSpacing: 0.1,
            }}>
              {d.transcript.map((tok, i) => {
                if (tok.type === 'word') {
                  return <span key={i}>{tok.text} </span>;
                }
                if (tok.type === 'filler') {
                  return <span key={i} style={{ color: T.pauseLex, fontStyle: 'italic' }}>{tok.text} </span>;
                }
                if (tok.type === 'pause') {
                  if (tok.dur < 0.8) return <span key={i} style={{ color: T.inkMute }}>· </span>;
                  return (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '1px 7px', margin: '0 3px',
                      background: pauseColors[tok.kind] + '22',
                      border: `1px solid ${pauseColors[tok.kind]}66`,
                      borderRadius: 6,
                      fontFamily: T.mono, fontSize: 10, color: pauseColors[tok.kind],
                      verticalAlign: 'middle',
                    }}>
                      <PauseDot kind={tok.kind} size={6}/> {tok.dur.toFixed(1)}s
                    </span>
                  );
                }
              })}
            </div>
          </Card>

          <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.5, padding: '0 4px' }}>
            <span style={{ color: T.pauseLex, fontStyle: 'italic' }}>Italic orange</span> marks fillers.
            Boxed timestamps show pauses longer than 0.8s, color-coded by cause.
          </div>
        </div>
      )}

      {tab === 'scores' && (
        <div style={{ padding: '0 18px' }}>
          {[
            ['Fluency & coherence', s.fluency, 'You spoke clearly but paused mid-sentence 3 times. Work on connecting clauses.'],
            ['Lexical resource', s.lexical, 'Good range with "pine forests", "cool weather". Reach for less common synonyms.'],
            ['Grammatical range', s.grammar, 'Mostly simple present. Try mixing in present perfect ("I have been going…").'],
            ['Pronunciation', s.pronunciation, 'Clear segmentals. Word stress on "memorable" needs work.'],
          ].map(([k, v, note]) => (
            <Card key={k} style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{k}</div>
                <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink }}>{v.toFixed(1)}</div>
              </div>
              <div style={{ height: 4, background: T.beigeSoft, borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v/9)*100}%`, background: T.ink }}/>
              </div>
              <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>{note}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAUSE COACH — drill the bridges
// ─────────────────────────────────────────────
function CoachScreen({ go, back }) {
  const d = window.LS_DATA;
  const [cat, setCat] = React.useState('thinking');
  const cats = [
    { k: 'thinking', label: 'Thinking pauses', desc: 'When you need a moment to plan your answer.' },
    { k: 'lexical', label: 'Lexical gaps', desc: 'When you can\'t find the right word.' },
    { k: 'grammar', label: 'Grammar hesitation', desc: 'When you\'re mid-sentence and unsure of tense or structure.' },
  ];
  const current = cats.find(c => c.k === cat);

  return (
    <div style={{ padding: '8px 18px 100px', fontFamily: T.sans }}>
      <div onClick={back} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        color: T.inkSoft, fontSize: 14, marginTop: 4, marginBottom: 12, cursor: 'pointer',
      }}>{Icon.back(18, T.inkSoft)} Back</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {Icon.spark(14, T.pauseLex)}
        <div style={{ fontSize: 11, color: T.pauseLex, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 600 }}>
          Pause coach
        </div>
      </div>
      <h1 style={{
        fontFamily: T.serif, fontSize: 28, fontWeight: 400, margin: '4px 0 8px',
        letterSpacing: -0.3, color: T.ink, lineHeight: 1.2,
      }}>
        Bridge phrases for<br/><span style={{ fontStyle: 'italic' }}>natural fluency.</span>
      </h1>
      <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.5, marginBottom: 22 }}>
        Native speakers don't pause silently — they fill the gap with a phrase that buys time. Learn these by category and practice using them.
      </div>

      {/* Category picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
        {cats.map(c => (
          <div key={c.k} onClick={() => setCat(c.k)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
            background: cat === c.k ? T.ink : T.card,
            color: cat === c.k ? '#fff' : T.ink,
            border: `1px solid ${cat === c.k ? T.ink : T.line}`,
            transition: 'all 0.15s',
          }}>
            <PauseDot kind={c.k} size={10}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: cat === c.k ? 'rgba(255,255,255,0.6)' : T.inkMute, marginTop: 2 }}>
                {c.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bridge phrase cards */}
      <SectionLabel>{current.label.toLowerCase()} · 3 phrases to memorize</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {d.bridges[cat].map((phrase, i) => (
          <Card key={i} style={{ padding: 16, position: 'relative' }}>
            <div style={{
              fontFamily: T.serif, fontSize: 18, lineHeight: 1.35, color: T.ink,
              fontStyle: 'italic', letterSpacing: 0.1,
            }}>
              "{phrase}"
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}`,
            }}>
              <div style={{ fontSize: 11, color: T.inkMute, fontFamily: T.mono }}>
                buys ~{(phrase.length / 15).toFixed(1)}s
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: T.ink, fontWeight: 500, cursor: 'pointer',
              }}>
                {Icon.play(14, T.ink)} Listen
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Drill CTA */}
      <Card style={{
        background: T.beigeSoft, border: 'none', padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: T.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {Icon.mic(16, '#fff')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>Try a 30-second drill</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.4 }}>
              Answer a question using one of these phrases naturally.
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={() => go('record')}>Start drill</Btn>
        </div>
      </Card>
    </div>
  );
}

window.RecordScreen = RecordScreen;
window.FeedbackScreen = FeedbackScreen;
window.CoachScreen = CoachScreen;
