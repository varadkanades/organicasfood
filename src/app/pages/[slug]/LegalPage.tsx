"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, FileX } from "lucide-react";
import Container from "@/components/ui/Container";
import { fetchPageBySlug, type SitePage } from "@/lib/supabase-pages";

export default function LegalPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<SitePage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchPageBySlug(slug);
      if (!data) {
        setNotFound(true);
      } else {
        setPage(data);
      }
      setIsLoading(false);
    }
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <FileX className="h-12 w-12 text-soft-stone mx-auto mb-4" />
            <h1 className="font-heading text-2xl text-deep-forest mb-3">
              Page not found
            </h1>
            <p className="text-sm text-mid-gray mb-6">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="text-sm text-fresh-green hover:underline"
            >
              Go to homepage
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-mid-gray hover:text-rich-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <h1 className="font-heading text-2xl sm:text-3xl text-deep-forest mb-2">
            {page.title}
          </h1>
          <p className="text-xs text-mid-gray mb-8">
            Last updated:{" "}
            {new Date(page.updated_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="bg-white rounded-xl border border-soft-stone/50 shadow-sm p-6 sm:p-8">
            <div
              className="legal-content text-sm text-rich-black leading-relaxed
                [&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-deep-forest [&_h2]:mt-8 [&_h2]:mb-3 first:[&_h2]:mt-0
                [&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-deep-forest [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:mb-4 [&_p]:text-mid-gray
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-mid-gray
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-mid-gray
                [&_li]:mb-1.5
                [&_a]:text-fresh-green [&_a]:underline [&_a]:hover:text-fresh-green/80
                [&_strong]:text-rich-black [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
