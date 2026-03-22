import { getProducts, getCategories } from "@/lib/actions/products";
import { getSiteSettings } from "@/lib/actions/site-settings";
import { getActiveCoupons } from "@/lib/actions/coupons";
import ShopClient from "./ShopClient";

export const revalidate = 1800;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;

  const [productsResult, categoriesResult, settingsResult, couponsResult] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getSiteSettings(),
      getActiveCoupons(),
    ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success
    ? (categoriesResult.data ?? [])
    : [];
  const siteSettings = settingsResult.success
    ? (settingsResult.settings ?? null)
    : null;
  const coupons = couponsResult.success ? (couponsResult.coupons ?? []) : [];

  return (
    <ShopClient
      initialProducts={products}
      initialCategories={categories}
      initialSiteSettings={siteSettings}
      initialCoupons={coupons}
      urlSearchQuery={params.search ?? ""}
      urlCategory={params.category ?? ""}
    />
  );
}
