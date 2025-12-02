import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { cookies } from "next/headers";
import { cache } from "react";

export const getProducts = cache(
  async (params?: { page?: number; perPage?: number }) => {
    const { page = 1, perPage = 20 } = params || {};
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    const anon = getAnonSupabase();
    const admin = getAdminSupabase();

    let role: "customer" | "admin" = "customer";
    let userId: string | null = null;

    if (token) {
      const { data: userData, error: userErr } = await anon.auth.getUser(token);
      if (!userErr && userData?.user?.id) {
        userId = userData.user.id;
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (profile && profile.role === "admin") role = "admin";
      }
    }

    const { data, error } = await admin
      .from("products")
      .select("*")
      .contains("visible_to", ["customer"])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("products fetch error", error);
      throw new Error("Failed to fetch products");
    }

    const products = (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      price: Number(p.price),
      visible_to: p.visible_to,
      created_at: p.created_at,
    }));

    return {
      products,
      meta: { page, perPage, role, userId },
    };
  },
);
