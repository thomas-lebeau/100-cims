export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // require("dd-trace").tracer.init({
    //   service: "100-cims",
    //   version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    //   env: process.env.NEXT_PUBLIC_VERCEL_ENV,
    //   site: "datadoghq.eu",
    //   token: process.env.DD_API_KEY,
    // });
    require("dd-trace/init");
  }
}
