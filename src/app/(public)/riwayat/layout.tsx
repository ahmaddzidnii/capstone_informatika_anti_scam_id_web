import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { callbackSDK } from "@/lib/callback-sdk";

interface LayoutPageProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

const LayoutPage = async ({ children }: LayoutPageProps) => {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    const rawUrl = reqHeaders.get("x-url");

    if (rawUrl) {
      const parsed = new URL(rawUrl);
      const query = Object.fromEntries(parsed.searchParams.entries());

      const loginUrl = callbackSDK.createLoginRedirect({
        path: parsed.pathname,
        ...(Object.keys(query).length > 0 ? { query } : {}),
      });

      redirect(loginUrl);
    }

    redirect("/login");
  }

  return <div>{children}</div>;
};

export default LayoutPage;
