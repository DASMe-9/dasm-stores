import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchaseSection } from "@/components/product/ProductPurchaseSection";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ShareButton } from "@/components/shared/ShareButton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getProduct, getStore } from "@/lib/api-server";
import {
  breadcrumbSchema,
  canonicalUrl,
  jsonLdString,
  productSchema,
} from "@/lib/seo";

export const revalidate = 120;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  const [storeData, prod] = await Promise.all([getStore(slug), getProduct(slug, productId)]);
  if (!storeData || !prod?.product) notFound();

  const product = prod.product;
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.primary_image?.url
        ? [{ url: product.primary_image.url, alt_text: product.primary_image.alt_text }]
        : [];

  const crumbs = breadcrumbSchema([
    { name: storeData.store.name, path: `/store/${slug}` },
    { name: "المنتجات", path: `/store/${slug}/products` },
    { name: product.name, path: `/store/${slug}/products/${productId}` },
  ]);

  const pSchema = productSchema({
    id: product.id,
    slug: product.slug,
    storeSlug: slug,
    title: product.name,
    description: product.description,
    price: product.price,
    images: gallery.map((i) => i.url),
    availability: "InStock",
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(pSchema) }} />

      <nav className="mb-6 text-xs text-[var(--muted-foreground)]">
        <Link href={`/store/${slug}`} className="hover:underline">
          {storeData.store.name}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/store/${slug}/products`} className="hover:underline">
          المنتجات
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={gallery} alt={product.name} />
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold leading-snug">{product.name}</h1>
          {product.sku ? (
            <p className="text-xs text-[var(--muted-foreground)]">SKU: {product.sku}</p>
          ) : null}
          <ProductPurchaseSection slug={slug} product={product} />
          <div className="flex flex-wrap gap-2">
            <WhatsAppButton phone={storeData.store.contact_whatsapp} label="استفسر عبر واتساب" />
            <ShareButton
              title={product.name}
              url={canonicalUrl(`/store/${slug}/products/${productId}`)}
            />
          </div>
          {product.description ? (
            <div className="prose prose-sm max-w-none pt-4 text-[var(--muted-foreground)]">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          ) : null}
        </div>
      </div>

      <ProductReviews reviews={product.reviews} />
    </>
  );
}
