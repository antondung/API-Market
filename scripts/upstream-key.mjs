// Provision only the derived origin key to a third-party upstream; never the master.
import { originSigningKey } from "../mock-services/gateway-auth.mjs";
const origin = new URL(process.argv[2]);
if (
  !["https:", "http:"].includes(origin.protocol) ||
  origin.username ||
  origin.password ||
  origin.pathname !== "/" ||
  origin.search ||
  origin.hash
)
  throw Error("Supply an HTTP(S) origin only");
console.log(
  originSigningKey(process.env.GATEWAY_UPSTREAM_SECRET ?? "", origin.origin),
);
