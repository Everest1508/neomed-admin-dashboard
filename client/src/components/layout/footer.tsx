export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 mt-8 border-t border-border">
      <div className="px-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Copyright: Beforth.in
          </div>
        </div>
      </div>
    </footer>
  );
}