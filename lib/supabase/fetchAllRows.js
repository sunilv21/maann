const PAGE_SIZE = 1000;

export async function fetchAllRows(query) {
  const rows = [];
  let offset = 0;

  while (true) {
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    if (error) return { data: null, error };

    const page = data || [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { data: rows, error: null };
    offset += PAGE_SIZE;
  }
}
