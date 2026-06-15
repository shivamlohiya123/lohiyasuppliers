import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { getSettings } from "./settings";

export const getCachedSettings = unstable_cache(
  async () => getSettings(),
  ["site-settings"],
  { revalidate: 300, tags: ["settings"] }
);

export const getCachedCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
  ["nav-categories"],
  { revalidate: 300, tags: ["categories"] }
);
