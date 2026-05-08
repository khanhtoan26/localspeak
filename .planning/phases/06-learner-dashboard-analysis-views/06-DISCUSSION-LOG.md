# Phase 6: Learner Dashboard & Analysis Views - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08T15:02:34.887+07:00
**Phase:** 6-Learner Dashboard & Analysis Views
**Areas discussed:** Dashboard hierarchy, Pause timeline, Word/phoneme visuals, AI Coach + Save/history boundary

---

## Dashboard hierarchy

| Question | Options Presented | User's choice |
|----------|-------------------|---------------|
| What should be the primary takeaway at the top of the results? | Practice priority first; IELTS bands first; Scorecard first; You decide | You decide |
| Should the header explain why the priority was chosen, or stay very compact? | Compact reason; Metrics only; Expanded coaching card; You decide | You decide |
| How should JSON and Audio Mode feel together on the page? | Two practice paths; Simple tabs; Guided flow; You decide | You decide |
| Should the dashboard include saved-session controls in the main results header if Phase 6 includes history UI? | Secondary controls; No saved-session UI in Phase 6; Prominent history workflow; You decide | You decide |

**Notes:** User delegated these dashboard hierarchy choices to the agent. CONTEXT.md locks a learner-first dashboard with compact rationale, two practice paths, and secondary saved-session controls.

---

## Pause timeline

| Question | Options Presented | User's choice |
|----------|-------------------|---------------|
| What should be the main pause view? | Timeline first + list below; List first + optional mini timeline; Timeline only; You decide | You decide |
| How should pause severity be communicated visually? | Color + label; Subtle shading only; IELTS-impact labels; You decide | You decide |
| What context should each pause show? | Before/after words + duration; Full phrase snippet; Timestamp only; You decide | Before/after words + duration |
| Should the view include an explicit practice cue for the worst pause? | Yes, one cue; No, keep practice advice in AI Coach only; Only if there is a critical pause; You decide | Yes, one cue |

**Notes:** User explicitly locked before/after words plus duration, and one practice cue for the worst pause. Other choices were delegated to the agent.

---

## Word/phoneme visuals

| Question | Options Presented | User's choice |
|----------|-------------------|---------------|
| How should word scores be shown? | Inline chips in sentence order; Grouped by score; Hybrid; You decide | You decide |
| How should phoneme weaknesses be ranked? | Worst repeated patterns first; Vietnamese-priority first; IELTS-impact grouping; You decide | You decide |
| What level of explanation should phoneme rows include? | Brief learner explanation; Minimal metrics only; Drill preview; You decide | You decide |
| Should Vietnamese learner hints appear directly in the dashboard when relevant? | Yes, conditional hints; No, keep locale-specific coaching in AI feedback only; Always show a small Vietnamese learner note; You decide | You decide |

**Notes:** User delegated these choices to the agent. CONTEXT.md locks inline sentence-order word chips, practical-impact phoneme ranking, brief explanations, and conditional Vietnamese learner hints when supported by data.

---

## AI Coach + Save/history boundary

| Question | Options Presented | User's choice |
|----------|-------------------|---------------|
| How prominent should AI feedback be in the dashboard? | Button + dedicated tab; AI Coach card in summary; Primary CTA; You decide | You decide |
| How should the UI handle streamed IELTS analysis when JSON feedback is currently non-streamed strict JSON? | Streaming-style states without changing API; Require true streaming for JSON AI feedback; Only audio mode needs streamed output; You decide | You decide |
| Should Phase 6 include learner-facing saved-session UI from Phase 5's deferred notes? | Include a light version; Defer entirely; Save only; You decide | You decide |
| If included, where should saved sessions appear? | Secondary sidebar/panel; Top-level History tab beside JSON/Audio modes; Small header controls only; You decide | You decide |

**Notes:** User delegated these choices to the agent. CONTEXT.md locks deterministic metrics first, opt-in AI Coach, no required JSON streaming API change, and a lightweight secondary saved-session UI.

---

## the agent's Discretion

- Dashboard headline priority, compact rationale, and exact metric hierarchy.
- Mode labels and layout presentation.
- Pause timeline visual design and severity legend details.
- Word chip styling and optional weak-word shortlist.
- Phoneme ranking formula and row explanation wording.
- Exact saved-session secondary UI surface.

## Deferred Ideas

- Rename/delete/update saved sessions.
- Authenticated saved history and account linking.
- Advanced progress analytics across saved attempts.
- Lexical Resource, Grammar scoring, and full IELTS Speaking simulation.
