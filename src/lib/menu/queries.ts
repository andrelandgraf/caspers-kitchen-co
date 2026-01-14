import { db } from "@/lib/db/client";
import { eq, and, or, ilike, inArray, sql } from "drizzle-orm";
import {
  menuItems,
  menuItemDietaryTypes,
  customizationOptions,
  categoryEnum,
  dietaryTypeEnum,
} from "./schema";
import { menuItemLocations } from "@/lib/locations/schema";
import { v7 as uuidv7 } from "uuid";

export type MenuItem = typeof menuItems.$inferSelect;
export type MenuItemWithRelations = MenuItem & {
  dietaryTypes: string[];
  customizationOptions: (typeof customizationOptions.$inferSelect)[];
};

export type MenuItemInsert = typeof menuItems.$inferInsert;
export type CategoryType = (typeof categoryEnum.enumValues)[number];
export type DietaryType = (typeof dietaryTypeEnum.enumValues)[number];

export interface MenuFilters {
  category?: CategoryType;
  dietaryTypes?: DietaryType[];
  search?: string;
  availableOnly?: boolean;
  locationId?: string;
}

export async function getMenuItems(
  filters?: MenuFilters,
): Promise<MenuItemWithRelations[]> {
  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(menuItems.category, filters.category));
  }

  if (filters?.availableOnly) {
    conditions.push(eq(menuItems.isAvailable, true));
  }

  if (filters?.search) {
    conditions.push(
      or(
        ilike(menuItems.name, `%${filters.search}%`),
        ilike(menuItems.description, `%${filters.search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let items: MenuItem[];

  // If filtering by location, join with menu_item_locations
  if (filters?.locationId) {
    const itemsQuery = await db
      .select({ menuItem: menuItems })
      .from(menuItems)
      .innerJoin(
        menuItemLocations,
        and(
          eq(menuItemLocations.menuItemId, menuItems.id),
          eq(menuItemLocations.locationId, filters.locationId),
          eq(menuItemLocations.isAvailable, true),
        ),
      )
      .where(whereClause)
      .orderBy(menuItems.featured, menuItems.name);

    items = itemsQuery.map((row) => row.menuItem);
  } else {
    items = await db
      .select()
      .from(menuItems)
      .where(whereClause)
      .orderBy(menuItems.featured, menuItems.name);
  }

  if (items.length === 0) {
    return [];
  }

  const itemIds = items.map((item) => item.id);

  // Batch fetch all dietary types and customizations in 2 queries instead of N*2
  const [allDietary, allCustomizations] = await Promise.all([
    db
      .select()
      .from(menuItemDietaryTypes)
      .where(inArray(menuItemDietaryTypes.menuItemId, itemIds)),
    db
      .select()
      .from(customizationOptions)
      .where(inArray(customizationOptions.menuItemId, itemIds)),
  ]);

  // Group by menuItemId for fast lookup
  const dietaryByItemId = new Map<string, string[]>();
  for (const d of allDietary) {
    const existing = dietaryByItemId.get(d.menuItemId) ?? [];
    existing.push(d.dietaryType);
    dietaryByItemId.set(d.menuItemId, existing);
  }

  const customizationsByItemId = new Map<
    string,
    (typeof customizationOptions.$inferSelect)[]
  >();
  for (const c of allCustomizations) {
    const existing = customizationsByItemId.get(c.menuItemId) ?? [];
    existing.push(c);
    customizationsByItemId.set(c.menuItemId, existing);
  }

  // Build result with dietary type filtering
  const itemsWithRelations: MenuItemWithRelations[] = [];

  for (const item of items) {
    const dietaryTypeValues = dietaryByItemId.get(item.id) ?? [];

    if (
      filters?.dietaryTypes &&
      filters.dietaryTypes.length > 0 &&
      !filters.dietaryTypes.every((type) => dietaryTypeValues.includes(type))
    ) {
      continue;
    }

    itemsWithRelations.push({
      ...item,
      dietaryTypes: dietaryTypeValues,
      customizationOptions: customizationsByItemId.get(item.id) ?? [],
    });
  }

  return itemsWithRelations;
}

export async function getMenuItemBySlug(
  slug: string,
): Promise<MenuItemWithRelations | null> {
  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.slug, slug))
    .limit(1);

  if (items.length === 0) {
    return null;
  }

  const item = items[0];

  const dietary = await db
    .select()
    .from(menuItemDietaryTypes)
    .where(eq(menuItemDietaryTypes.menuItemId, item.id));

  const customizations = await db
    .select()
    .from(customizationOptions)
    .where(eq(customizationOptions.menuItemId, item.id));

  return {
    ...item,
    dietaryTypes: dietary.map((d) => d.dietaryType),
    customizationOptions: customizations,
  };
}

export async function getFeaturedMenuItems(): Promise<MenuItemWithRelations[]> {
  const items = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.featured, true), eq(menuItems.isAvailable, true)))
    .limit(6);

  if (items.length === 0) {
    return [];
  }

  const itemIds = items.map((item) => item.id);

  const [allDietary, allCustomizations] = await Promise.all([
    db
      .select()
      .from(menuItemDietaryTypes)
      .where(inArray(menuItemDietaryTypes.menuItemId, itemIds)),
    db
      .select()
      .from(customizationOptions)
      .where(inArray(customizationOptions.menuItemId, itemIds)),
  ]);

  const dietaryByItemId = new Map<string, string[]>();
  for (const d of allDietary) {
    const existing = dietaryByItemId.get(d.menuItemId) ?? [];
    existing.push(d.dietaryType);
    dietaryByItemId.set(d.menuItemId, existing);
  }

  const customizationsByItemId = new Map<
    string,
    (typeof customizationOptions.$inferSelect)[]
  >();
  for (const c of allCustomizations) {
    const existing = customizationsByItemId.get(c.menuItemId) ?? [];
    existing.push(c);
    customizationsByItemId.set(c.menuItemId, existing);
  }

  return items.map((item) => ({
    ...item,
    dietaryTypes: dietaryByItemId.get(item.id) ?? [],
    customizationOptions: customizationsByItemId.get(item.id) ?? [],
  }));
}

export async function createMenuItem(
  data: Omit<MenuItemInsert, "id" | "createdAt" | "updatedAt">,
  dietaryTypes?: DietaryType[],
): Promise<MenuItem> {
  const id = uuidv7();

  const [item] = await db
    .insert(menuItems)
    .values({
      ...data,
      id,
    })
    .returning();

  if (dietaryTypes && dietaryTypes.length > 0) {
    await db.insert(menuItemDietaryTypes).values(
      dietaryTypes.map((type) => ({
        id: uuidv7(),
        menuItemId: id,
        dietaryType: type,
      })),
    );
  }

  return item;
}

export async function updateMenuItemAvailability(
  id: string,
  isAvailable: boolean,
): Promise<void> {
  await db.update(menuItems).set({ isAvailable }).where(eq(menuItems.id, id));
}

export async function getMenuItemsByIds(
  ids: string[],
): Promise<MenuItemWithRelations[]> {
  if (ids.length === 0) {
    return [];
  }

  const items = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, ids));

  if (items.length === 0) {
    return [];
  }

  const itemIds = items.map((item) => item.id);

  const [allDietary, allCustomizations] = await Promise.all([
    db
      .select()
      .from(menuItemDietaryTypes)
      .where(inArray(menuItemDietaryTypes.menuItemId, itemIds)),
    db
      .select()
      .from(customizationOptions)
      .where(inArray(customizationOptions.menuItemId, itemIds)),
  ]);

  const dietaryByItemId = new Map<string, string[]>();
  for (const d of allDietary) {
    const existing = dietaryByItemId.get(d.menuItemId) ?? [];
    existing.push(d.dietaryType);
    dietaryByItemId.set(d.menuItemId, existing);
  }

  const customizationsByItemId = new Map<
    string,
    (typeof customizationOptions.$inferSelect)[]
  >();
  for (const c of allCustomizations) {
    const existing = customizationsByItemId.get(c.menuItemId) ?? [];
    existing.push(c);
    customizationsByItemId.set(c.menuItemId, existing);
  }

  return items.map((item) => ({
    ...item,
    dietaryTypes: dietaryByItemId.get(item.id) ?? [],
    customizationOptions: customizationsByItemId.get(item.id) ?? [],
  }));
}
