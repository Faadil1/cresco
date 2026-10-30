import {readFileSync} from "node:fs";
import {resolve} from "node:path";

// Public learning version is a standalone website, without a backend,
// invitation, accounts, role tokens or online state.
const output=resolve("dist/server/wrangler.json");
const config=JSON.parse(readFileSync(output,"utf8"));
if (config.name!=="cresco-family-web" || config.workers_dev!==false ||
    config.preview_urls!==false || config.route || config.routes?.length) {
  throw new Error("PUBLIC_FAMILY_BUILD_NOT_ISOLATED_OR_SEALED");
}
if (process.env.CRESCO_FAMILY_PUBLIC_DEMO!=="1" ||
    process.env.NEXT_PUBLIC_CRESCO_API_URL) {
  throw new Error("PUBLIC_FAMILY_DEMO_REQUIRES_NO_API_ORIGIN");
}
console.log(JSON.stringify({
  status:"PASS",worker:config.name,backendRequired:false,
  visitorLoginRequired:false,invitationRequired:false,
  dataPersistence:"memory-in-browser-tab-only",deployed:false,
  publiclyRouted:false,verified:"standalone-artifact-config-only"
},null,2));
