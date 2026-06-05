import Logo from "./Logo";

const links = [
  { label: "Sobre", href: "#" },
  { label: "Termos", href: "#" },
  { label: "Privacidade", href: "#" },
  { label: "Contato", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-white pb-6">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

      <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-6 pt-10 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + slogan */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Logo />
            <span className="hidden md:inline-block text-slate-200">|</span>
            <p className="text-xs text-text-muted">
              Publique seu problema. Encontre a solução.
            </p>
          </div>

          {/* Links and Copyright compressed */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <nav className="flex items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group relative text-xs font-semibold text-text-muted hover:text-accent transition-colors duration-300"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1.5px] w-0 bg-accent rounded-full transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
            <p className="text-[10px] text-text-faint">
              © {new Date().getFullYear()} Preciso. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
