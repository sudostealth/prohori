export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page should NOT have AdminShell - just render the page
  return <>{children}</>;
}
