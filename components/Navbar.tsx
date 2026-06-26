export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-fei-text/5 bg-fei-bg/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
          <span className="text-xs font-medium text-fei-sky sm:text-sm">
            Football English Intelligence
          </span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/login" className="rounded-full border border-fei-sky px-5 py-2 text-sm font-medium text-fei-sky transition-colors hover:bg-fei-sky/10">
            Login
          </a>
          <a href="/register" className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90">
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}
