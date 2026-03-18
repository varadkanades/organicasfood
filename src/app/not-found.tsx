import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="font-heading text-6xl text-deep-forest">404</h1>
      <p className="mt-4 text-lg text-mid-gray">
        This page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </Container>
  );
}
