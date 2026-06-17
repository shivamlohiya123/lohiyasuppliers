import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { getPlatformSettings } from "./settings";

export const getCachedSettings = unstable_cache(
  async () => getPlatformSettings(),
  ["platform-settings"],
  { revalidate: 300, tags: ["settings"] }
);

export const getCachedCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, type: true },
    }),
  ["nav-categories"],
  { revalidate: 300, tags: ["categories"] }
);
