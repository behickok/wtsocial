// Prisma client stub for wireframe mode.
// In production, this will be replaced with the actual Prisma client
// configured with PostgreSQL. For the wireframe, all data operations
// go through lib/db/mock-store.ts instead.

/* eslint-disable @typescript-eslint/no-explicit-any */
const noopProxy: any = new Proxy(
  {},
  {
    get: () =>
      new Proxy(() => {}, {
        get: () => () => Promise.resolve(null),
        apply: () => Promise.resolve(null),
      }),
  },
);

export const prisma: any = noopProxy;
