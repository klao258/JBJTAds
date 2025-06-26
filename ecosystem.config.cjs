// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: "JBJTAds",
        script: "app.js",
        interpreter: "node",
        cwd: __dirname,
        watch: false,
        autorestart: true,
        env: {
          NODE_ENV: "production"
        }
      }
    ]
};