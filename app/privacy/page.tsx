import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy policy — Bordelyx',
  description: 'How Bordelyx handles local game progress, hosting information, and shared challenge results.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" summary="Your game progress belongs on your device. Here is what Bordelyx stores, what happens when you share, and how to clear your data.">
      <section aria-labelledby="privacy-scope">
        <h2 id="privacy-scope">About this policy</h2>
        <p>This policy covers the Bordelyx geography game on this site. Bordelyx is published through ChatGPT Sites. The game and the platform that hosts it handle different information, as explained below.</p>
      </section>
      <section aria-labelledby="privacy-progress">
        <h2 id="privacy-progress">Game progress stays in your browser</h2>
        <p>Bordelyx uses your browser’s local storage to remember your explorer passport. This includes your personal best, achievement badges, daily completion dates, streak, and up to 100 recent game records. Each record contains its challenge seed, mode, score, outcome, and date.</p>
        <p>This information is stored under <code>bordelyx-progress-v1</code> on the device and browser you use. The game does not upload these records to a central leaderboard or sync them between devices. Country guesses and the current route are processed in the browser during play.</p>
        <p>The most recent 100 game records are retained; older records are replaced as you play. Your best score, badges, and daily completion dates remain until you clear the site’s stored data or your browser removes it.</p>
      </section>
      <section aria-labelledby="privacy-hosting">
        <h2 id="privacy-hosting">Hosting and access</h2>
        <p>Loading the site and its assets requires ordinary web requests. Hosting and access providers may process information such as your IP address, browser or device details, requested URLs, and security or access logs to deliver and protect the site. A private site may also require a platform account or an access check.</p>
        <p>The game does not request or maintain a separate account profile. Platform authentication, hosting records, their retention, and applicable international processing are governed by the provider’s arrangements and, where relevant, your organization’s workspace settings.</p>
        <p>See <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener noreferrer">OpenAI’s privacy policy</a> and its <a href="https://openai.com/business-data/" target="_blank" rel="noopener noreferrer">business data information</a> for the platform’s practices.</p>
      </section>
      <section aria-labelledby="privacy-technologies">
        <h2 id="privacy-technologies">Cookies, maps, and device permissions</h2>
        <p>The game does not add advertising trackers or an analytics service. It uses local storage for game progress; the hosting or sign-in platform may use its own cookies or similar technologies.</p>
        <p>The default map, country data, and 3D globe are served with the site. An optional Mapbox rendering configuration may use the Mapbox SDK; its handling of service requests is subject to <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer">Mapbox’s privacy policy</a>. The game disables that SDK’s performance-metrics collection.</p>
        <p>Bordelyx does not request your precise location, camera, or microphone. It does not collect payment details. Sound effects play only when you enable them.</p>
      </section>
      <section aria-labelledby="privacy-sharing">
        <h2 id="privacy-sharing">Sharing is your choice</h2>
        <p>When you use a share or copy control, Bordelyx writes the selected result or challenge code to your clipboard. A shared result can contain your score, mode, route flags, date, and a challenge link or seed. It does not include a player name or account identifier from the game.</p>
        <p>Nothing is posted to another service automatically. If you paste a result into another app or send a challenge link, the recipient and that service will receive what you share. Avoid including personal or confidential information in a custom challenge seed.</p>
        <p>External links, including the model credit on Sketchfab, lead to services with their own privacy practices.</p>
      </section>
      <section aria-labelledby="privacy-controls">
        <h2 id="privacy-controls">Your controls</h2>
        <p>You can view your local scores and badges in the explorer passport. To remove them, clear this site’s data in your browser’s privacy or site-storage settings. You can also remove the <code>bordelyx-progress-v1</code> entry using your browser’s application-storage tools.</p>
        <p>Clearing local data permanently removes the game progress saved in that browser. Bordelyx has no server copy from which to restore it. Blocking local storage may prevent progress from being remembered.</p>
        <p>Depending on the law that applies to you, you may have rights to access, correct, delete, or restrict the use of personal information, to object to processing, or to contact a data-protection authority. For platform account or hosting information, use the provider’s privacy channels or contact your workspace administrator. For questions about this particular site, contact the person or organization that shared Bordelyx with you.</p>
      </section>
      <section aria-labelledby="privacy-updates">
        <h2 id="privacy-updates">Changes to this policy</h2>
        <p>If the game’s data practices change, this page will be updated with a revised date. You can also read the <Link href="/terms/">terms of use</Link>.</p>
      </section>
    </LegalPage>
  );
}
