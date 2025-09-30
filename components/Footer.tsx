// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-xs text-gray-500 dark:text-neutral-500">
      © {new Date().getFullYear()} Nico Belazaras · London ·
      {" "} <a className="underline" href="mailto:belazaras@live.com">belazaras@live.com</a>
    </footer>
  );
}
