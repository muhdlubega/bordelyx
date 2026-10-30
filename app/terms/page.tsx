import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of use — Bordelyx',
  description: 'Terms for playing Bordelyx, sharing challenges, and using its geography game content.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" summary="Play fairly, respect the work behind the game, and enjoy the world as a playground.">
      <section aria-labelledby="terms-scope">
        <h2 id="terms-scope">Using Bordelyx</h2>
        <p>These terms cover your use of the Bordelyx geography game on this site. You may play the game and share challenge codes and result summaries for lawful purposes. Access may also be subject to the hosting platform’s terms and your organization’s workspace rules.</p>
        <p>Bordelyx currently offers browser-based play without payments, a central leaderboard, or synchronized multiplayer. Shared challenges recreate game conditions; results are not independently verified competition records.</p>
      </section>
      <section aria-labelledby="terms-conduct">
        <h2 id="terms-conduct">Play fairly</h2>
        <p>Do not disrupt the service, bypass access restrictions, attempt to obtain other people’s information, or use the site to distribute malicious content. Do not present manipulated or unverified results as an official ranking, certification, or prize result.</p>
        <p>You are responsible for material you choose to share outside the game. Do not put private information, abusive content, or content you lack permission to share into custom challenge codes or accompanying messages.</p>
      </section>
      <section aria-labelledby="terms-geography">
        <h2 id="terms-geography">A game atlas</h2>
        <p>Bordelyx uses simplified cartographic data and game rules. Country shapes, borders, names, routes, distances, and scores may be approximate or incomplete. Country-level routes may combine disconnected territories, and the game’s border rules do not describe whether a real border is open or safe to cross.</p>
        <p>The atlas is for entertainment. It is not a source of travel, navigation, immigration, security, or other professional guidance. Names and boundaries do not express a position on sovereignty or disputed territory.</p>
      </section>
      <section aria-labelledby="terms-content">
        <h2 id="terms-content">Content and model credits</h2>
        <p>Playing or sharing a result does not transfer ownership of the site’s code, design, artwork, or third-party assets. Those materials remain subject to the rights and licenses of their respective owners. Open-source libraries and public-domain map data retain their own terms.</p>
        <p>The 3D globe is “Airports around the world” by <a href="https://sketchfab.com/famousandfaded" target="_blank" rel="noopener noreferrer">famousandfaded on Sketchfab</a>. Its embedded metadata identifies the <a href="https://sketchfab.com/3d-models/airports-around-the-world-e58f56a352b540469fd209abf0c37bc5" target="_blank" rel="noopener noreferrer">original model</a> and the <a href="https://sketchfab.com/licenses" target="_blank" rel="noopener noreferrer">Sketchfab Standard license</a>. Its appearance in Bordelyx does not grant a separate right to reuse or redistribute the model.</p>
      </section>
      <section aria-labelledby="terms-progress">
        <h2 id="terms-progress">Your progress and privacy</h2>
        <p>Scores, badges, and streaks are stored locally in your browser. They may be lost if you clear site data, change devices or browsers, or if browser storage is removed. Keep any result you want to preserve by copying it yourself.</p>
        <p>The <Link href="/privacy/">privacy policy</Link> explains the information the game stores, sharing controls, and the separate role of hosting and access providers.</p>
      </section>
      <section aria-labelledby="terms-availability">
        <h2 id="terms-availability">Availability and changes</h2>
        <p>Features, rules, challenge generation, and availability may change as Bordelyx develops. The site may be interrupted for maintenance, technical issues, or access changes. No particular score, streak, challenge, or uninterrupted availability is guaranteed.</p>
        <p>Use the game with the care appropriate to an entertainment service. To the extent allowed by applicable law, Bordelyx is provided without a promise that its content will be error-free or suitable for a particular purpose. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.</p>
      </section>
      <section aria-labelledby="terms-updates">
        <h2 id="terms-updates">Updates and questions</h2>
        <p>Revised terms will be posted on this page with an updated date. For questions about this site, contact the person or organization that shared Bordelyx with you. Platform account or workspace-access questions should go to the relevant provider or your workspace administrator.</p>
      </section>
    </LegalPage>
  );
}
