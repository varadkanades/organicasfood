import ProductDetailPage from "./product-detail-page";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ProductPageProps) {
  // Await params for Next.js 16 compatibility
  const { slug } = await params;

  return <ProductDetailPage />;
}
