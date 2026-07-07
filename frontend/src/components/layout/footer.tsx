/**
 * Minimal app footer with tech stack credit.
 */
export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          Built with{" "}
          <span className="font-medium text-foreground/70">Next.js</span>,{" "}
          <span className="font-medium text-foreground/70">Express</span> &{" "}
          <span className="font-medium text-foreground/70">Google Gemini AI</span>
        </p>
      </div>
    </footer>
  );
}
