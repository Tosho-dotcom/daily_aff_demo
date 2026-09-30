import type { Metadata } from "next";
import Unsubscribe from "@/components/Unsubscribe";
import { APP } from "@/lib/config";

export const metadata: Metadata = {
  title: `Unsubscribe — ${APP.name}`,
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  return <Unsubscribe email={one(sp.e)} token={one(sp.t)} />;
}
