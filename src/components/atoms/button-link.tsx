import Link from "next/link";
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`wow-cta ${secondary ? "secondary" : ""}`} href={href}>
      {children}
    </Link>
  );
}
