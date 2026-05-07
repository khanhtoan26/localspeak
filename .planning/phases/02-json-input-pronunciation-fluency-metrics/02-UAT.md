---
status: testing
phase: 02-json-input-pronunciation-fluency-metrics
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md]
started: 2026-05-07T08:39:29Z
updated: 2026-05-07T08:39:29Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Cold Start Smoke Test
expected: |
  From a clean start, the app can boot and the primary JSON analysis page loads. The backend health check responds, the homepage shows "Analyze speech assessment JSON", and no startup error is shown.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: From a clean start, the app can boot and the primary JSON analysis page loads. The backend health check responds, the homepage shows "Analyze speech assessment JSON", and no startup error is shown.
result: [pending]

### 2. JSON Mode Input and Sample Acceptance
expected: Opening the homepage shows JSON Mode, a "Speech assessment JSON" input card, "Load sample JSON", "Upload .json file", and a disabled "Analyze JSON" button. Clicking "Load sample JSON" fills the input, runs backend validation, then shows "This JSON can be analyzed." or "Analyzable with warnings" and enables Analyze JSON.
result: [pending]

### 3. Malformed JSON Syntax Feedback
expected: Pasting malformed JSON keeps analysis disabled and shows "This does not look like valid JSON yet." with guidance to check for a missing comma, quote, or closing bracket. "Show technical details" reveals parser details without showing a success state.
result: [pending]

### 4. Backend Schema Validation Feedback
expected: Pasting syntactically valid but incomplete JSON, such as {}, triggers backend validation. The UI shows "Some required speech assessment fields are missing or malformed.", issue count/details, and "Show all issues" when more details exist; Analyze JSON stays disabled.
result: [pending]

### 5. JSON Upload and Clear Flow
expected: Uploading a valid .json file under 2 MB fills the input and previews it just like paste/sample input. Clicking "Clear JSON" asks for confirmation, and confirming resets the textarea, preview card, metadata, and Analyze JSON disabled state.
result: [pending]

### 6. Manual Analyze and Summary Metrics
expected: After a valid preview, no analysis result appears until "Analyze JSON" is clicked. Clicking it shows "Computing deterministic metrics from the JSON...", then renders five summary cards in this order: Pronunciation percentage, Pronunciation Band, Fluency Band, WPM, Pause ratio.
result: [pending]

### 7. Result Tabs and Deterministic Coaching Copy
expected: After analysis, the result tabs show "Summary", "Words", "Phonemes", and "Pauses". Summary includes "What this means", "Pronunciation signals", "Fluency signals", and deterministic coach-like wording; it does not claim Gemini or IELTS examiner judgment.
result: [pending]

### 8. Words, Phonemes, and Pauses Details
expected: The Words tab shows original-order words with Weak/Okay/Good labels, score percentages, and timings. The Phonemes tab shows up to five repeated weak ARPAbet patterns with IPA examples, counts, averages, and example words. The Pauses tab shows only Natural, Noticeable, or Critical pause severities with durations, nearby words, timing gaps, and explanations.
result: [pending]

### 9. Warnings, Empty States, and Stale Results
expected: Warning responses still render metrics with an "Analyzable with warnings" callout. Empty weak-word, weak-phoneme, or pause data shows positive empty states. Editing JSON after a successful analysis shows "Input changed. Analyze again to update results." until analysis is rerun.
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps

[none yet]
