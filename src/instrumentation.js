export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    require("dd-trace").init({
      env: process.env.VERCEL_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA,
      service: "100-cims",
    });
  }
}
