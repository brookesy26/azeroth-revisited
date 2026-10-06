import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wow-content guide-heading">
      <p className="wow-kicker">A ROAD NOT YET OPEN</p>
      <h1>This page is missing.</h1>
      <p>The address may have changed, or the guide may not exist yet.</p>
      <Link className="wow-cta" href="/">
        Return to Azeroth →
      </Link>
    </div>
  );
}
