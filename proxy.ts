import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh de tokens (única llamada a auth en todo el ciclo de la request).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pasar info de sesión a los Server Components vía headers.
  // Así el Header NO necesita volver a tocar Supabase auth, lo cual evita
  // el doble refresh que rompía las cookies.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    requestHeaders.set("x-user-id", user.id);
    if (profile?.role) {
      requestHeaders.set("x-user-role", profile.role);
    }

    // Recrear response con los headers nuevos, preservando las cookies
    // que setAll pudo haber escrito durante el refresh.
    const cookiesToPreserve = response.cookies.getAll();
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    cookiesToPreserve.forEach((cookie) => {
      response.cookies.set(cookie);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

