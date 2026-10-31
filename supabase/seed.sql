-- Only insert if products table is empty
do $$
begin
  if not exists (select 1 from public.products limit 1) then
    insert into public.products (name, category, price, description, material, svg_key) values
    ('Rose Pearl Pendant', 'necklace', 1299, 'A graceful rose-gold chain adorned with a lustrous freshwater pearl drop. Hypoallergenic and perfect for everyday wear.', 'Rose Gold Plated · Freshwater Pearl', 'n1'),
    ('Lavender Crystal Chain', 'necklace', 2199, 'Faceted crystals in soft lavender tones set along a fine sterling silver chain. Catches light with every movement.', 'Sterling Silver · Swarovski-grade Crystal', 'n2'),
    ('Golden Floral Choker', 'necklace', 1599, 'Intricate floral motifs in 22K gold plating — a bold yet feminine statement piece for celebrations.', '22K Gold Plated Brass', 'n3'),
    ('Diamond Dew Drop', 'necklace', 3499, 'Premium lab-created diamond solitaire set in white gold, suspended from a delicate 18-inch chain. Timeless.', 'White Gold · Lab-Created Diamond', 'n4'),
    ('Silver Moon Locket', 'necklace', 999, 'A vintage-inspired sterling silver crescent moon locket — holds a cherished photo close to your heart.', 'Sterling Silver', 'n5'),
    ('Pearl Halo Studs', 'earring', 899, 'Classic shell pearls with a rose gold halo setting. Lightweight and comfortable for all-day wear.', 'Rose Gold Plated · Shell Pearl', 'e1'),
    ('Lavender Chandelier', 'earring', 1499, 'Cascading chandelier earrings with amethyst-inspired lavender crystals. Designed for evenings and celebrations.', 'Gold Plated · Lavender Crystal', 'e2'),
    ('Rose Gold Hoops', 'earring', 749, 'Sleek rose gold hoops with a subtle hammered texture. A wardrobe essential that goes with everything.', 'Rose Gold Plated Brass', 'e3'),
    ('Crystal Teardrop', 'earring', 1199, 'Faceted crystal teardrop earrings in silver settings that shimmer with every movement.', 'Silver · Clear Crystal', 'e4'),
    ('Floral Jhumka', 'earring', 599, 'Traditional jhumka with a modern floral twist in antique gold finish. Lightweight despite the elaborate design.', 'Antique Gold Plated Brass', 'e5'),
    ('Pearl Charm Bracelet', 'bracelet', 1099, 'A delicate chain bracelet with three floating pearl charms in rose gold. Adjustable length, makes a perfect gift.', 'Rose Gold · Freshwater Pearl', 'b1'),
    ('Crystal Bangle Set', 'bracelet', 799, 'Set of three slim bangles — gold, rose gold, and lavender crystal — beautiful when stacked together.', 'Gold & Rose Gold Plated · Crystal', 'b2'),
    ('Rose Gold Chain', 'bracelet', 949, 'Minimalist rose gold paperclip chain bracelet. Wear solo for clean elegance or layer for a curated look.', 'Rose Gold Plated Sterling Silver', 'b3'),
    ('Floral Cuff', 'bracelet', 1299, 'An open cuff bracelet with hand-carved floral patterns in antique gold. One size fits most wrists.', 'Antique Gold Plated Brass', 'b4'),
    ('Diamond Tennis Bracelet', 'bracelet', 2999, 'A row of sparkling lab-created diamonds set in a flexible white gold bracelet. Pure luxury on the wrist.', 'White Gold · Lab-Created Diamonds', 'b5');

    -- Necklace variants (16/18/20 inch)
    insert into public.product_variants (product_id, label, value)
    select p.id, v.label, v.value
    from public.products p
    cross join (values ('16 inch', '16"'), ('18 inch', '18"'), ('20 inch', '20"')) as v(label, value)
    where p.category = 'necklace';

    -- Earring variants (Standard)
    insert into public.product_variants (product_id, label, value)
    select p.id, 'Standard', 'standard'
    from public.products p where p.category = 'earring';

    -- Bracelet variants (S/M/L)
    insert into public.product_variants (product_id, label, value)
    select p.id, v.label, v.value
    from public.products p
    cross join (values ('S (6 inch)', 'S'), ('M (7 inch)', 'M'), ('L (8 inch)', 'L')) as v(label, value)
    where p.category = 'bracelet';
  end if;
end $$;
