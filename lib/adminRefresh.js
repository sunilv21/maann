'use client';

const refreshHandlers = new Set();

export function registerAdminRefresh(handler) {
  refreshHandlers.add(handler);
  return () => refreshHandlers.delete(handler);
}

export async function refreshAdminData() {
  await Promise.all([...refreshHandlers].map(handler => handler()));
}
