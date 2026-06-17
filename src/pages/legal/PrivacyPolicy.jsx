// Privacy Policy required by Meta App Review and Google OAuth
// Verification. This page must be publicly reachable (no auth gate)
// and the URL must match what you submit in the Meta App Dashboard /
// Google Cloud Console.
//
// Stub copy below: replace the [PLACEHOLDERS] with your legal entity
// name, business address, and DPO email before submitting for review.

import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const updated = "2026-06-16";
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link to="/login" className="legal-back">← Home</Link>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated {updated}</p>
      </header>

      <section className="legal-section">
        <h2>1. Who we are</h2>
        <p>
          Art of Galaxy (&quot;AOG&quot;, &quot;we&quot;, &quot;us&quot;) operates the AOG Portal at{" "}
          <strong>portal.artofgalaxy.com</strong>. This policy describes what personal
          information we collect, what we do with it, who we share it with, and the
          choices and rights you have.
        </p>
        <p>
          You can contact us about this policy at{" "}
          <a href="mailto:info@artofgalaxy.com">info@artofgalaxy.com</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Information we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, profile photo, password hash, optional onboarding answers.</li>
          <li><strong>Project data:</strong> briefs you submit, generated assets, uploaded files, project status.</li>
          <li><strong>Social platform tokens:</strong> when you connect Instagram, Facebook, or YouTube, we store the OAuth access and refresh tokens that allow us to post on your behalf. <strong>Tokens are encrypted at rest using AES-256-GCM</strong> and are scoped to your account only.</li>
          <li><strong>Social platform metadata:</strong> the platform account id, handle, and display name we read from each connection so we can show you which account you have connected.</li>
          <li><strong>Usage logs:</strong> request timestamps, action types, and per-publish audit rows so we can debug failures and support you.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. How we use your information</h2>
        <ul>
          <li>To generate and deliver the services you request (logo design, brand guidelines, social posts, etc.).</li>
          <li>To publish content to your connected Instagram, Facebook, or YouTube accounts at the times you schedule.</li>
          <li>To send service-related notifications (publish failures, completed projects, account changes).</li>
          <li>To improve the platform, prevent abuse, and meet legal obligations.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information. We do not use your social
          platform tokens for any purpose other than the publishing actions you initiate
          inside the portal.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Third-party services we rely on</h2>
        <ul>
          <li><strong>Meta Platforms, Inc.</strong> for Instagram and Facebook publishing via the Graph API.</li>
          <li><strong>Google LLC</strong> for YouTube Shorts publishing via the YouTube Data API v3.</li>
          <li><strong>Anthropic PBC</strong> for AI text generation (the prompts you submit and the brand context you provide are sent to Claude).</li>
          <li><strong>fal.ai</strong> for AI image generation.</li>
          <li><strong>Higgsfield, Inc.</strong> for AI video generation (Reels).</li>
          <li><strong>Amazon Web Services</strong> for hosting and asset storage (S3).</li>
          <li><strong>Postgres</strong> (managed) for our application database.</li>
        </ul>
        <p>
          Each provider has its own privacy policy. We share with them only what is
          necessary to deliver the service you requested.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Your data from Meta and Google</h2>
        <p>
          Our use and transfer of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>,
          including the Limited Use requirements.
        </p>
        <p>
          For Meta, we comply with the{" "}
          <a href="https://developers.facebook.com/terms/" target="_blank" rel="noreferrer">Meta Platform Terms</a> and{" "}
          <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noreferrer">Developer Policies</a>.
          We only request the scopes required to publish the content you create in the portal.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Data retention</h2>
        <p>
          We keep your account and project data for as long as your account is active.
          Social platform tokens are stored until you disconnect the account or your
          account is deleted. Publish audit logs are retained for up to 90 days for
          support and compliance purposes.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Your rights</h2>
        <ul>
          <li><strong>Access:</strong> download a copy of your data from your profile.</li>
          <li><strong>Correct:</strong> edit your profile and project data in-app.</li>
          <li><strong>Delete:</strong> request account deletion (see <Link to="/legal/data-deletion">Data Deletion Instructions</Link>).</li>
          <li><strong>Withdraw consent:</strong> disconnect any social platform from the Connections page at any time. We immediately blank the stored tokens.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>8. Security</h2>
        <p>
          Tokens are encrypted at rest with AES-256-GCM using a key held only on our
          servers. Transport is HTTPS. Access to production databases is restricted to a
          small set of named operators.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Children</h2>
        <p>The portal is not directed to children under 13 and we do not knowingly collect data from them.</p>
      </section>

      <section className="legal-section">
        <h2>10. Changes</h2>
        <p>
          We may update this policy. We will post the new effective date at the top and,
          for material changes, notify you by email or in-app banner.
        </p>
      </section>

      <footer className="legal-footer">
        <Link to="/legal/data-deletion">Data Deletion Instructions →</Link>
      </footer>
    </main>
  );
}
