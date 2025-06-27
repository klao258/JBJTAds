// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "JBJTAds",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      interpreter: "node",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
