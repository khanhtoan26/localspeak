// Main App — navigation + Tweaks

const SCREENS = ['home', 'topics', 'record', 'feedback', 'coach', 'history'];

function App() {
  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "examiner": "warm",
    "showLiveTranscript": true,
    "density": "comfy",
    "accentMode": "warm"
  }/*EDITMODE-END*/);

  const [screen, setScreen] = React.useState('home');
  const [history, setHistory] = React.useState([]);

  const go = (s) => {
    setHistory(h => [...h, screen]);
    setScreen(s);
  };
  const back = () => {
    setHistory(h => {
      const next = [...h];
      const prev = next.pop();
      if (prev) setScreen(prev);
      else setScreen('home');
      return next;
    });
  };

  // Apply accent override
  React.useEffect(() => {
    const map = { warm: '#d97757', cool: '#4a6fa5', forest: '#3f6b4f', mono: '#1a1a1a' };
    if (map[t.accentMode]) {
      window.T.pauseLex = map[t.accentMode];
    }
  }, [t.accentMode]);

  let body;
  if (screen === 'home') body = <HomeScreen go={go}/>;
  else if (screen === 'topics') body = <TopicsScreen go={go} back={back}/>;
  else if (screen === 'record') body = <RecordScreen go={go} back={back}/>;
  else if (screen === 'feedback') body = <FeedbackScreen go={go} back={back}/>;
  else if (screen === 'coach') body = <CoachScreen go={go} back={back}/>;
  else if (screen === 'history') body = <HistoryScreen go={go} back={back}/>;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#efece5', padding: 24, fontFamily: T.sans,
    }}>
      <div data-screen-label={screen}>
        <IOSDevice width={390} height={844}>
          <div style={{ background: T.bg, minHeight: '100%', paddingTop: 50 }}>
            {body}
          </div>
        </IOSDevice>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Voice & feedback">
          <TweakRadio label="Examiner persona"
            value={t.examiner}
            onChange={v => setTweak('examiner', v)}
            options={[
              { value: 'strict', label: 'Strict' },
              { value: 'warm', label: 'Warm coach' },
            ]}/>
          <TweakToggle label="Live transcript"
            value={t.showLiveTranscript}
            onChange={v => setTweak('showLiveTranscript', v)}/>
        </TweakSection>
        <TweakSection label="Look">
          <TweakColor label="Accent"
            value={t.accentMode}
            onChange={v => setTweak('accentMode', v)}
            options={[
              { value: 'warm', color: '#d97757' },
              { value: 'cool', color: '#4a6fa5' },
              { value: 'forest', color: '#3f6b4f' },
              { value: 'mono', color: '#1a1a1a' },
            ]}/>
          <TweakRadio label="Density"
            value={t.density}
            onChange={v => setTweak('density', v)}
            options={[
              { value: 'comfy', label: 'Comfy' },
              { value: 'compact', label: 'Compact' },
            ]}/>
        </TweakSection>
        <TweakSection label="Jump to screen">
          {SCREENS.map(s => (
            <TweakButton key={s} label={s} onClick={() => setScreen(s)} secondary={screen !== s}/>
          ))}
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
