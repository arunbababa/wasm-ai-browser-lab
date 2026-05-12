import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp("index.html", resolve(dist, "index.html"));
await cp("src", resolve(dist, "src"), { recursive: true });
await cp("public", resolve(dist, "public"), { recursive: true });

console.log(`Built static site in ${dist}`);
