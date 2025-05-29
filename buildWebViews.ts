await Promise.all([
  Bun.build({
    entrypoints: ["./injectedWebviewScripts/readWebView.ts"],
    outdir: "./injectedWebviewScripts",
    format: "esm",
    naming: "[dir]/[name].js",
    // minify: true,
  }),
]);
