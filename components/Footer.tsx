// components/Footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-white/60">
        <div className="inline-flex items-center gap-2">
          <span>© {year} Nico Belazaras</span>
          <span className="h-1 w-1 rounded-full gradient-bg" />
          <span>London</span>
          <span className="h-1 w-1 rounded-full gradient-bg" />
          <a
            className="underline hover:text-white"
            href="mailto:belazaras@live.com"
          >
            belazaras@live.com
          </a>
        </div>
      </div>
    </footer>
  );
}
