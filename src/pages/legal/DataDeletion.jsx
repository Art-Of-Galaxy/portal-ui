// Data Deletion Instructions page. Meta App Review requires either a
// publicly-reachable URL with these instructions OR a callback URL that
// receives deletion requests. We provide both: this page (the human-
// facing instructions URL) plus the email shown below as the inbox the
// request is processed from.
//
// Submit this page's URL as the "Data Deletion Instructions URL" in
// the Meta App Dashboard.

import { Link } from "react-router-dom";

export default function DataDeletion() {
  const updated = "2026-06-16";
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link to="/login" className="legal-back">← Home</Link>
        <h1>Data Deletion Instructions</h1>
        <p className="legal-updated">Last updated {updated}</p>
      </header>

      <section className="legal-section">
        <h2>Self-serve</h2>
        <p>You can delete most of your data yourself from inside the portal:</p>
        <ol>
          <li>
            <strong>Disconnect social platforms.</strong> Open{" "}
            <Link to="/new-projects/social/connections">Social → Connections</Link> and
            press the trash icon on every connected account. We immediately blank the
            encrypted access tokens stored against your account.
          </li>
          <li>
            <strong>Delete individual projects.</strong> Open <Link to="/my-projects">My Projects</Link>,
            click any project, and press Delete project. Generated assets associated with
            the project are removed.
          </li>
          <li>
            <strong>Delete uploaded files.</strong> Open <Link to="/my-files">My Files</Link> and
            remove any uploaded reference material.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>Full account deletion</h2>
        <p>
          To delete your entire AOG Portal account along with every associated record,
          email us at{" "}
          <a href="mailto:privacy@artofgalaxy.com?subject=Delete%20my%20AOG%20account">privacy@artofgalaxy.com</a>{" "}
          from the email address associated with your account. Include the words
          &quot;Delete my account&quot; in the subject line.
        </p>
        <p>What we remove within 30 days of receiving the request:</p>
        <ul>
          <li>Your user profile (name, email, password hash, onboarding answers, profile photo).</li>
          <li>All projects you created, including briefs, generated specs, and generated assets.</li>
          <li>All uploaded files.</li>
          <li>All social platform connections (Instagram, Facebook, YouTube) and their encrypted tokens.</li>
          <li>All scheduled posts that have not yet published.</li>
        </ul>
        <p>What we retain (in anonymized or pseudonymized form):</p>
        <ul>
          <li>Aggregate usage statistics that cannot be linked back to you.</li>
          <li>Publish audit log entries for up to 90 days for fraud prevention and platform compliance, with personal identifiers replaced by a one-way hash.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Deleting data on Meta&apos;s side</h2>
        <p>
          Disconnecting Instagram or Facebook in the portal removes <em>our</em> stored
          tokens but does not delete the actual posts that were already published to
          your Page or Instagram profile. To remove published content, delete it
          directly from the Instagram app or Facebook Page.
        </p>
        <p>
          You can also revoke our app&apos;s permission from your side at any time:
          on Facebook, open <em>Settings → Apps and Websites → Active</em>, find the AOG
          Portal app and press Remove. Meta will notify us via webhook and we will
          treat this as a deletion request and blank the encrypted tokens within 24
          hours.
        </p>
      </section>

      <section className="legal-section">
        <h2>Deleting data on Google&apos;s side</h2>
        <p>
          For YouTube, you can revoke our access at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>.
          Once revoked, our stored refresh token stops working and the next health
          probe flips the connection to a &quot;Reconnect required&quot; state.
        </p>
      </section>

      <section className="legal-section">
        <h2>Questions</h2>
        <p>
          Email <a href="mailto:privacy@artofgalaxy.com">privacy@artofgalaxy.com</a> for
          anything we did not cover, including data portability requests and
          appeals.
        </p>
      </section>

      <footer className="legal-footer">
        <Link to="/legal/privacy">← Back to Privacy Policy</Link>
      </footer>
    </main>
  );
}
