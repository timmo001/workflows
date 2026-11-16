import { Predicate } from "effect";
import {
  lookup as systemLookup,
  promises as dns,
  type LookupAddress,
  type LookupOptions,
} from "node:dns";

/**
 * Public resolvers asked on every attempt. The runner's own resolver caches a
 * new custom domain's earlier NXDOMAIN, so retrying through it never sees the
 * record Cloudflare has just created.
 */
export const publicResolvers = ["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"];

/** dns error codes that mean the name has no address yet, not that DNS is unreachable. */
const noAddressCodes = new Set(["ENOTFOUND", "ENODATA"]);

export interface Resolve {
  readonly resolve4: (hostname: string) => Promise<string[]>;
  readonly resolve6: (hostname: string) => Promise<string[]>;
}

const publicResolver = (): Resolve => {
  const resolver = new dns.Resolver({ timeout: 3000, tries: 2 });

  resolver.setServers(publicResolvers);

  return resolver;
};

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

const families = { IPv4: 4, IPv6: 6 } as const;

/**
 * Resolves through the public resolvers, IPv4 first. Falls back to the system
 * lookup only when the public resolvers can't be reached, such as on a
 * network that blocks outside DNS.
 */
export const resolveAddresses = async (
  resolver: Resolve,
  hostname: string,
  family: number,
): Promise<LookupAddress[] | "unreachable"> => {
  const queries = [
    family === 6 ? undefined : resolver.resolve4(hostname),
    family === 4 ? undefined : resolver.resolve6(hostname),
  ];

  const results = await Promise.allSettled(
    queries.map((query) => query ?? Promise.resolve([])),
  );

  const addresses: LookupAddress[] = [];
  let reached = false;

  for (const [index, result] of results.entries()) {
    if (queries[index] === undefined) continue;

    if (result.status === "fulfilled") {
      reached = true;

      for (const address of result.value) {
        addresses.push({ address, family: index === 0 ? 4 : 6 });
      }
    } else if (
      Predicate.hasProperty(result.reason, "code") &&
      noAddressCodes.has(String(result.reason.code))
    ) {
      reached = true;
    }
  }

  return reached ? addresses : "unreachable";
};

/** A net.connect lookup that asks the resolver on every call. */
export const lookupThrough =
  (resolver: () => Resolve) =>
  (hostname: string, options: LookupOptions, callback: LookupCallback) => {
    const family = Predicate.isString(options.family)
      ? families[options.family]
      : (options.family ?? 0);

    resolveAddresses(resolver(), hostname, family).then(
      (addresses) => {
        if (addresses === "unreachable") {
          systemLookup(hostname, { ...options, all: true }, (error, all) =>
            options.all === true || error !== null
              ? callback(error, all)
              : callback(null, all[0]?.address ?? "", all[0]?.family),
          );

          return;
        }

        const [first] = addresses;

        if (first === undefined) {
          const error: NodeJS.ErrnoException = new Error(
            `getaddrinfo ENOTFOUND ${hostname} (public resolvers have no address yet)`,
          );

          error.code = "ENOTFOUND";

          callback(error, []);

          return;
        }

        if (options.all === true) callback(null, addresses);
        else callback(null, first.address, first.family);
      },
      (error: NodeJS.ErrnoException) => callback(error, []),
    );
  };

/** The lookup the smoke check connects with, through the public resolvers. */
export const publicLookup = lookupThrough(publicResolver);
