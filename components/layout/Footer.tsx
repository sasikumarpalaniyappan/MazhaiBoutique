"use client";

export default function Footer() {
  return (
    <footer id="contact" className="mt-10 border-t border-slate-200 bg-slate-50/80 text-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1.2fr]">
          <div>
            <h2
              className="text-lg sm:text-2xl font-semibold tracking-wide text-slate-900"
              style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}
            >
              Mazhai Boutique
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-600">
              Elegant essentials for timeless occasions and modern celebrations.
            </p>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
              <li><a href="/" className="transition hover:text-rose-600">Home</a></li>
              <li><a href="/#featured" className="transition hover:text-rose-600">Collections</a></li>
              <li><a href="/about" className="transition hover:text-rose-600">About</a></li>
              <li><a href="#contact" className="transition hover:text-rose-600">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Connect
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
              <a
                href="https://maps.google.com/?q=6/1017+A+Mullai+Valagam+Namakkal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-rose-300 hover:text-rose-600 flex-shrink-0"
                aria-label="Open location"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </a>

              <a
                href="https://wa.me/919566914912"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-rose-300 hover:text-rose-600 flex-shrink-0"
                aria-label="Open WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.6 4.3A9.9 9.9 0 0 0 3.1 16.2L2 22l5.9-1.5a9.9 9.9 0 0 0 9.7-15.2Zm-7.5 14.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.5.9.9-3.4-.2-.3A8.2 8.2 0 1 1 10.1 18.5Zm4.5-6.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.4.1-.1.1-.5.7-.6.8-.1.1-.2.1-.4 0a6.6 6.6 0 0 1-2-1.2 7.3 7.3 0 0 1-1.3-1.7c-.1-.2 0-.3.1-.4l.2-.2c.1-.1.1-.2.2-.3a.3.3 0 0 0 0-.3c0-.1-.4-1-.6-1.4-.1-.3-.2-.3-.4-.3h-.4c-.1 0-.3 0-.5.2a2.2 2.2 0 0 0-.7 1.6c0 .4.1.8.2 1.1.2.4.5.8.8 1.1A8.8 8.8 0 0 0 11.2 15c.5.2 1 .3 1.4.3.4 0 .8-.1 1.2-.2.4-.2.7-.5.8-.9.1-.3 0-.6-.1-.8l-.3-.2Z" />
                </svg>
              </a>

              <a
                href="https://instagram.com/mazhai_boutique"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-rose-300 hover:text-rose-600 flex-shrink-0"
                aria-label="Open Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>

              <a href="tel:+919566914912" className="text-xs sm:text-sm text-slate-600 transition hover:text-rose-600 whitespace-nowrap">
                +91 95669 14912
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 sm:px-6 py-3 text-center text-xs text-slate-500">
        © 2026 Mazhai Boutique. All Rights Reserved.
      </div>
    </footer>
  );
}
