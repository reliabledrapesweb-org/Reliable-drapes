import { getCatalogues } from "@/lib/actions/catalogues";
import { getCatalogueCategories } from "@/lib/actions/catalogue-categories";
import ECatalogueClient from "./ECatalogueClient";

export const revalidate = 1800;

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; open?: string; search?: string }>;
}) {
  const params = await searchParams;

  const [cataloguesResult, categoriesResult] = await Promise.all([
    getCatalogues(),
    getCatalogueCategories(),
  ]);

  const catalogues = cataloguesResult.success
    ? (cataloguesResult.data ?? [])
    : [];
  const categories = categoriesResult.success
    ? (categoriesResult.data ?? [])
    : [];

  return (
    <ECatalogueClient
      initialCatalogues={catalogues}
      initialCategories={categories}
      urlCategory={params.category ?? ""}
      urlSearch={params.search ?? ""}
      openCatalogueId={params.open ?? null}
    />
  );
}
