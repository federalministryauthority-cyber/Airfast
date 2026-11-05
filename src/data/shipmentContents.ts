export const OTHER_CONTENTS_PREFIX = 'Other:';
export const CONTENTS_SEPARATOR = '; ';
export const OTHER_CONTENTS_MAX_LENGTH = 120;

const CONTENTS_BY_CATEGORY: Record<string, readonly string[]> = {
  general_merchandise: ['Household goods', 'Toys and games', 'Stationery and office supplies', 'Kitchenware', 'Gifts and souvenirs', 'Hardware and tools'],
  electronics: ['Mobile phones and tablets', 'Laptops and computers', 'Televisions and monitors', 'Audio equipment', 'Cables and chargers', 'Small appliances'],
  clothing_textiles: ['Clothing', 'Shoes and footwear', 'Bags and accessories', 'Bed linen and towels', 'Fabrics and yarn', 'Uniforms'],
  food_products: ['Dry and packaged food', 'Canned goods', 'Beverages', 'Spices and condiments', 'Confectionery and snacks', 'Supplements'],
  machinery_equipment: ['Industrial machines', 'Spare parts', 'Generators and engines', 'Pumps and compressors', 'Workshop equipment', 'Electrical equipment'],
  documents: ['Legal papers', 'Certificates and diplomas', 'Contracts', 'Financial documents', 'Printed materials', 'Identity documents'],
  medical_supplies: ['Medicines', 'Medical devices', 'First aid supplies', 'Laboratory samples (non-hazardous)', 'Surgical supplies', 'Mobility aids'],
  agricultural_products: ['Seeds and seedlings', 'Fertilisers', 'Farm tools', 'Dried crops and grains', 'Fresh produce', 'Animal feed'],
  automotive_parts: ['Engine parts', 'Tyres and wheels', 'Brake components', 'Electrical parts', 'Body parts', 'Lubricants and fluids'],
  furniture_household: ['Chairs and tables', 'Beds and mattresses', 'Cabinets and shelving', 'Home decor', 'Lighting fixtures', 'Kitchen appliances'],
  cosmetics_beauty: ['Skincare', 'Haircare', 'Fragrances', 'Make-up', 'Grooming tools', 'Nail products'],
  pet_supplies: ['Pet food', 'Pet accessories', 'Pet toys', 'Pet grooming products', 'Aquarium equipment', 'Pet carriers and beds'],
  perishable_goods: ['Fresh fish and seafood', 'Fresh meat', 'Dairy products', 'Fresh fruit', 'Vegetables', 'Flowers and plants'],
  fragile_goods: ['Glassware', 'Ceramics and porcelain', 'Artwork', 'Mirrors', 'Musical instruments', 'Crystal and figurines'],
  industrial_materials: ['Metals and alloys', 'Plastics and polymers', 'Chemicals (non-hazardous)', 'Raw minerals', 'Packaging materials', 'Rubber'],
  construction_materials: ['Cement and concrete', 'Tiles and stone', 'Timber and wood panels', 'Pipes and fittings', 'Roofing materials', 'Insulation'],
  sports_equipment: ['Fitness equipment', 'Bicycles', 'Team sports equipment', 'Camping gear', 'Water sports equipment', 'Protective gear'],
  personal_effects: ['Clothing and personal items', 'Books and reading materials', 'Keepsakes', 'Jewellery and watches', 'Personal electronics', 'Toiletries'],
  other_goods: ['Mixed goods', 'Samples', 'Seasonal items', 'Gifts'],
};

export interface ContentsSelection {
  items: string[];
  other: string | null;
}

export function contentsForCategory(category: string): readonly string[] {
  return CONTENTS_BY_CATEGORY[category] ?? [];
}

export function parseContents(value: string): ContentsSelection {
  const selection: ContentsSelection = { items: [], other: null };
  if (!value.trim()) return selection;
  for (const rawPart of value.split(';')) {
    const part = rawPart.trim();
    if (!part) continue;
    if (part.startsWith(OTHER_CONTENTS_PREFIX)) {
      selection.other = part.slice(OTHER_CONTENTS_PREFIX.length).trim();
    } else {
      selection.items.push(part);
    }
  }
  return selection;
}

export function serializeContents(selection: ContentsSelection): string {
  const parts = [...selection.items];
  if (selection.other !== null) parts.push(`${OTHER_CONTENTS_PREFIX} ${selection.other.replace(/;/g, ',').trim()}`);
  return parts.join(CONTENTS_SEPARATOR);
}

export function retainContentsForCategory(value: string, category: string): string {
  const allowed = new Set(contentsForCategory(category));
  const selection = parseContents(value);
  return serializeContents({ ...selection, items: selection.items.filter((item) => allowed.has(item)) });
}

export function formatContents(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const selection = parseContents(value);
  const parts = [...selection.items];
  if (selection.other !== null) parts.push(selection.other ? `Other (${selection.other})` : 'Other');
  return parts.length > 0 ? parts.join(', ') : null;
}
