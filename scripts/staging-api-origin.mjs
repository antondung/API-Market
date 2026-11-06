import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export function validateStagingApiOrigin(value) {
  const fail = () =>
    new Error(
      "STAGING_API_BASE_URL must be a real HTTPS DNS origin without credentials, path, query or fragment",
    );
  if (typeof value !== "string" || !value.trim() || /\s/.test(value.trim()))
    throw fail();
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw fail();
  }
  const host = url.hostname.toLowerCase(),
    labels = host.split(".");
  const dns =
    host.length <= 253 &&
    labels.length > 1 &&
    labels.every((label) =>
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
    ) &&
    /[a-z]/.test(labels.at(-1));
  const reserved =
    /(^|\.)(example\.(com|net|org)|localhost|invalid|test|local|internal|example)$/.test(
      host,
    );
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !dns ||
    reserved
  )
    throw fail();
  return url.origin;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    console.log(validateStagingApiOrigin(process.env.STAGING_API_BASE_URL));
  } catch {
    console.error(
      "Set repository variable STAGING_API_BASE_URL to the real HTTPS backend origin before publishing staging images.",
    );
    process.exitCode = 1;
  }
}
