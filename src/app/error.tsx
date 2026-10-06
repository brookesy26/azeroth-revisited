"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wow-content" role="alert">
      <h1>This guide could not load.</h1>
      <p>Try again, or return to a different guide using the menu.</p>
      <button className="wow-cta" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
