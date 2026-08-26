export type PublicInformationKey = 'privacy' | 'content-policy' | 'accessibility' | 'changelog' | 'data'

export interface PublicInformationSection {
  heading: string
  paragraphs?: string[]
  items?: string[]
  steps?: string[]
}

export interface PublicInformationDocument {
  eyebrow: string
  title: string
  summary: string
  updated: string
  sections: PublicInformationSection[]
}

export const publicInformation: Record<PublicInformationKey, PublicInformationDocument> = {
  privacy: {
    eyebrow: 'Privacy statement',
    title: 'Your learning record stays yours.',
    summary: 'Pathfinder’s public MVP stores progress in this browser and has no analytics transport, account system, or hidden feedback submission.',
    updated: 'August 26, 2026',
    sections: [
      { heading: 'Data stored on this device', items: ['Learning preferences and onboarding choices', 'Guided-practice attempts and completion records', 'Repair plans, daily sessions, confidence selections, and earned milestones', 'Local product events used to prepare voluntary diagnostic summaries', 'An unfinished feedback draft, when one exists', 'Replaceable application files and reviewed content cached for offline use'] },
      { heading: 'Data transmission', paragraphs: ['The static application does not transmit learning history or local product events. Feedback is copied to your clipboard. If a public feedback URL is configured, Pathfinder opens that external site only after you press the feedback action; you decide whether to paste and submit the report.'], items: ['No advertising or behavioral analytics', 'No account or cross-device synchronization', 'No API key in the browser bundle', 'No confidence information in feedback unless a future, separately reviewed flow explicitly asks for it'] },
      { heading: 'Control and deletion', paragraphs: ['Download a progress backup from Progress → Your data before clearing browser storage. Use Reset data on that page to delete Pathfinder progress from the current browser. A saved feedback draft is removed after a successful copy action and can also be cleared with site data.', 'Application updates replace only public files in Cache Storage; they do not delete local learning records. Clearing all browser site data removes both the offline application cache and private local data.'] },
      { heading: 'External services', paragraphs: ['Repository, source, and feedback links leave Pathfinder. The destination’s privacy policy applies after you open it. Optional AI development services are not part of the static public MVP and deterministic coaching remains available without them.'] },
    ],
  },
  'content-policy': {
    eyebrow: 'Content policy',
    title: 'Reviewed reasoning is authoritative.',
    summary: 'Pathfinder teaches derivation through deterministic, versioned coaching rather than asking an AI system to decide correctness.',
    updated: 'August 26, 2026',
    sections: [
      { heading: 'Instructional standard', items: ['Coaching paths proceed from contract and constraints to state, invariant, transitions, correctness, and complexity.', 'Wrong-answer feedback identifies the misconception without revealing later answers.', 'Content changes that affect stored evidence receive a new coaching-content version.', 'Exact traces use reviewed fixtures; deterministic phase summaries are labeled instructional overviews.'] },
      { heading: 'Sources and provenance', paragraphs: ['Pathfinder’s explanations, hints, coaching sequences, and trace fixtures are maintained separately as reviewed application content. The foundations catalog includes metadata derived from newfacade/LeetCodeDataset v0.3.1 under its MIT license. Source metadata remains attached to imported problem records.'], items: ['Imported-source attribution does not by itself resolve rights to upstream third-party problem prose.', 'Pathfinder does not present imported statements as original Pathfinder writing.', 'See the repository THIRD_PARTY_NOTICES.md for the complete bundled notice.'] },
      { heading: 'Optional AI boundary', paragraphs: ['Experimental AI may only be an explicit, isolated enhancement. It does not determine pass/fail, mastery, repairs, or the canonical learning path. The public static application requires no AI service.'] },
      { heading: 'Corrections', paragraphs: ['Use Give feedback to report a factual, attribution, trace, or accessibility issue. Include the page route; Pathfinder adds the application and coaching-content versions to the copied report.'] },
    ],
  },
  accessibility: {
    eyebrow: 'Accessibility statement',
    title: 'Practice should not depend on a mouse.',
    summary: 'Pathfinder is designed for keyboard, touch, narrow screens, reduced motion, and screen-reader navigation.',
    updated: 'August 26, 2026',
    sections: [
      { heading: 'Supported interaction', items: ['Semantic links and buttons provide keyboard paths through navigation and coaching.', 'Trace playback includes named controls, keyboard instructions, and live state announcements.', 'Learning maps include an ordered semantic-list view in addition to visual cards.', 'Status is communicated with text and icons rather than color alone.', 'Layouts adapt for narrow mobile screens and touch targets.'] },
      { heading: 'Motion and focus', paragraphs: ['Trace playback detects reduced-motion preferences and disables automatic animation. Dialogs use named close controls, feedback status is announced through a polite live region, and offline connectivity changes are announced without moving keyboard focus.', 'Installation and update controls remain user initiated. Pathfinder asks before applying an update so a coaching interaction is not refreshed unexpectedly.'] },
      { heading: 'Known testing boundary', paragraphs: ['Automated checks supplement, but do not replace, keyboard and screen-reader review. Before each broad release, Pathfinder performs keyboard navigation, narrow-screen, reduced-motion, and manual screen-reader spot checks.'] },
      { heading: 'Report a barrier', paragraphs: ['Use the persistent Give feedback action. Describe the page, control, assistive technology, and expected result when possible. The report is copied locally before you choose whether to submit it externally.'] },
    ],
  },
  changelog: {
    eyebrow: 'Changelog',
    title: 'What changed in Pathfinder.',
    summary: 'Public-facing changes are recorded here alongside the reviewed coaching-content version shown in trust disclosures.',
    updated: 'August 26, 2026',
    sections: [
      { heading: '0.2.0 — Installable and offline', items: ['Added installable app metadata, Pathfinder icons, and GitHub Pages-compatible application scope.', 'Added complete offline access to reviewed deterministic learning routes after the first successful visit.', 'Added user-controlled update prompts, connectivity announcements, and installation guidance.', 'Self-hosted Pathfinder’s fonts and kept AI and external feedback destinations network-only.'] },
      { heading: '0.1.0 — Public MVP', items: ['Added guided onboarding and daily mastery sessions.', 'Added the Personal Error Atlas and deterministic repair lifecycle.', 'Added optional confidence calibration with private proficiency signals.', 'Added eight authored learning maps and privacy-safe local milestone cards.', 'Added visible content verification, trace-quality labels, local-first beta feedback, and public policy pages.'] },
      { heading: 'Content versioning', paragraphs: ['The current coaching version appears inside each “How this is verified” disclosure. Stored attempts retain the version used when the decision was recorded, allowing repair explanations to acknowledge later content updates.'] },
    ],
  },
  data: {
    eyebrow: 'Data guide',
    title: 'Back up, restore, or remove your progress.',
    summary: 'Pathfinder has no account backend. A downloaded JSON backup is the portable copy of your learning record.',
    updated: 'August 26, 2026',
    sections: [
      { heading: 'Download a backup', steps: ['Open Progress from the main navigation.', 'Find Your data and choose Download backup.', 'Store the JSON file somewhere you control. It contains private learning history, so treat it accordingly.'] },
      { heading: 'Restore or merge a backup', steps: ['Open Progress → Your data in the destination browser.', 'Choose Restore backup and select a Pathfinder JSON backup.', 'Pathfinder validates the schema and known content references before merging stable records. Existing learning preferences on the destination browser are retained.', 'If validation fails, the existing progress remains unchanged and Pathfinder offers a recovery copy.'] },
      { heading: 'Delete local data', steps: ['Download a backup first if you may want the history later.', 'Open Progress and choose Reset data.', 'Confirm the reset. This clears Pathfinder progress and the active problem session from this browser. Clear site data in browser settings to also remove any remaining feedback draft and the replaceable offline application cache.'] },
      { heading: 'What is not synchronized', paragraphs: ['Backups are manual. Pathfinder does not silently upload, synchronize, or reconcile data between devices.'] },
    ],
  },
}
