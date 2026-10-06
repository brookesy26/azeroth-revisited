import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide, getGuides } from "@/lib/content/repository";
import { GuidePage } from "@/components/organisms/guide-page";
export const dynamicParams = false;
export function generateStaticParams() {
  return getGuides().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/${guide.slug}/` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      images: ["/images/blackrock.webp"],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
