// Mock data for IELTS speaking practice
window.LS_DATA = {
  user: {
    name: 'Minh',
    streak: 7,
    lastBand: 6.5,
    targetBand: 7.5,
    sessionsThisWeek: 4,
  },

  // Today's drill recommendation
  todayDrill: {
    part: 'Part 2',
    topic: 'Describe a place you like to visit',
    duration: '1–2 min',
    difficulty: 'Medium',
  },

  // Topics organized by part
  topics: {
    'Part 1': [
      { q: 'Do you work or study?', tag: 'Personal', mins: 0.5 },
      { q: 'What do you usually do at weekends?', tag: 'Lifestyle', mins: 0.5 },
      { q: 'Tell me about your hometown.', tag: 'Place', mins: 0.5 },
      { q: 'Do you enjoy cooking?', tag: 'Hobbies', mins: 0.5 },
    ],
    'Part 2': [
      { q: 'Describe a place you like to visit', tag: 'Place', mins: 2, hot: true },
      { q: 'Describe a person who inspires you', tag: 'People', mins: 2 },
      { q: 'Describe a book that influenced you', tag: 'Culture', mins: 2 },
      { q: 'Describe a memorable journey', tag: 'Travel', mins: 2 },
    ],
    'Part 3': [
      { q: 'Why do people travel abroad?', tag: 'Society', mins: 1 },
      { q: 'How has technology changed reading?', tag: 'Tech', mins: 1 },
      { q: 'Should governments fund the arts?', tag: 'Policy', mins: 1 },
    ],
  },

  // Cue card for current Part 2 question
  cueCard: {
    main: 'Describe a place you like to visit.',
    bullets: [
      'Where it is',
      'How often you go there',
      'What you do there',
      'And explain why you like it',
    ],
    prepTime: 60,
    speakTime: 120,
  },

  // Transcript with pause markers (the hero data)
  // tokens: { type: 'word'|'pause'|'filler', text, t (sec start), dur, kind? }
  transcript: [
    { type: 'word', text: 'So,', t: 0.0, dur: 0.4 },
    { type: 'pause', t: 0.4, dur: 0.6, kind: 'natural' },
    { type: 'word', text: 'the', t: 1.0, dur: 0.2 },
    { type: 'word', text: 'place', t: 1.2, dur: 0.4 },
    { type: 'word', text: 'I', t: 1.6, dur: 0.15 },
    { type: 'word', text: 'want', t: 1.75, dur: 0.3 },
    { type: 'word', text: 'to', t: 2.05, dur: 0.15 },
    { type: 'word', text: 'talk', t: 2.2, dur: 0.3 },
    { type: 'word', text: 'about', t: 2.5, dur: 0.4 },
    { type: 'word', text: 'is', t: 2.9, dur: 0.2 },
    { type: 'pause', t: 3.1, dur: 1.8, kind: 'lexical', note: 'Searching for the noun "Da Lat"' },
    { type: 'word', text: 'Da', t: 4.9, dur: 0.3 },
    { type: 'word', text: 'Lat,', t: 5.2, dur: 0.5 },
    { type: 'word', text: 'a', t: 5.7, dur: 0.15 },
    { type: 'word', text: 'small', t: 5.85, dur: 0.4 },
    { type: 'word', text: 'town', t: 6.25, dur: 0.4 },
    { type: 'word', text: 'in', t: 6.65, dur: 0.2 },
    { type: 'word', text: 'the', t: 6.85, dur: 0.2 },
    { type: 'word', text: 'mountains', t: 7.05, dur: 0.6 },
    { type: 'word', text: 'of', t: 7.65, dur: 0.2 },
    { type: 'word', text: 'Vietnam.', t: 7.85, dur: 0.7 },
    { type: 'pause', t: 8.55, dur: 2.4, kind: 'thinking', note: 'Long planning pause — try a bridge phrase' },
    { type: 'filler', text: 'um,', t: 10.95, dur: 0.5 },
    { type: 'word', text: 'I', t: 11.45, dur: 0.15 },
    { type: 'word', text: 'go', t: 11.6, dur: 0.25 },
    { type: 'word', text: 'there', t: 11.85, dur: 0.35 },
    { type: 'pause', t: 12.2, dur: 1.6, kind: 'grammar', note: 'Hesitation around tense — "go" vs "have been going"' },
    { type: 'word', text: 'maybe', t: 13.8, dur: 0.4 },
    { type: 'word', text: 'twice', t: 14.2, dur: 0.4 },
    { type: 'word', text: 'a', t: 14.6, dur: 0.15 },
    { type: 'word', text: 'year', t: 14.75, dur: 0.4 },
    { type: 'word', text: 'with', t: 15.15, dur: 0.3 },
    { type: 'word', text: 'my', t: 15.45, dur: 0.2 },
    { type: 'word', text: 'family.', t: 15.65, dur: 0.6 },
    { type: 'pause', t: 16.25, dur: 0.8, kind: 'natural' },
    { type: 'filler', text: 'uh,', t: 17.05, dur: 0.4 },
    { type: 'word', text: 'what', t: 17.45, dur: 0.25 },
    { type: 'word', text: 'I', t: 17.7, dur: 0.15 },
    { type: 'word', text: 'love', t: 17.85, dur: 0.35 },
    { type: 'word', text: 'is', t: 18.2, dur: 0.2 },
    { type: 'pause', t: 18.4, dur: 2.1, kind: 'lexical', note: 'Reaching for descriptive vocabulary' },
    { type: 'word', text: 'the', t: 20.5, dur: 0.2 },
    { type: 'word', text: 'cool', t: 20.7, dur: 0.35 },
    { type: 'word', text: 'weather', t: 21.05, dur: 0.4 },
    { type: 'word', text: 'and', t: 21.45, dur: 0.25 },
    { type: 'word', text: 'the', t: 21.7, dur: 0.2 },
    { type: 'word', text: 'pine', t: 21.9, dur: 0.35 },
    { type: 'word', text: 'forests.', t: 22.25, dur: 0.7 },
  ],

  // Aggregated scores
  scores: {
    overall: 6.5,
    fluency: 6.0,
    lexical: 6.5,
    grammar: 6.5,
    pronunciation: 7.0,
    wpm: 98,
    pauseCount: 5,
    longPauses: 3, // > 1.2s
    fillerCount: 2,
    totalDuration: 23,
  },

  // Pause coach: bridge phrases by category
  bridges: {
    thinking: [
      'That\'s an interesting question — let me think about that for a moment.',
      'Well, off the top of my head…',
      'I\'d say the first thing that comes to mind is…',
    ],
    lexical: [
      'It\'s the kind of thing that… you know, when you…',
      'I can\'t think of the exact word, but it\'s similar to…',
      'How can I put it… basically, …',
    ],
    grammar: [
      'Let me rephrase that.',
      'Or rather, I should say…',
      'What I mean is…',
    ],
  },

  // History
  history: [
    { date: 'Today', topic: 'Describe a place you like', band: 6.5, dur: '2:14' },
    { date: 'Yesterday', topic: 'Hometown', band: 6.5, dur: '1:48' },
    { date: 'May 5', topic: 'A book that influenced you', band: 6.0, dur: '2:31' },
    { date: 'May 4', topic: 'Weekend activities', band: 7.0, dur: '1:12' },
  ],
};
