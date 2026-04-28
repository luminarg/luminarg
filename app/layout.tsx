import "./globals.css";
import Header from "@/app/components/Header";
import { getCurrentProfile, getCurrentUser } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const isLoggedIn = !!user;
  const isInternal = isInternalUser(profile?.role);

  return (
    <html lang="es">
      <body>
        <Header isLoggedIn={isLoggedIn} isInternal={isInternal} />
        {children}
      </body>
    </html>
  );
}