// ecosystem.config.js
export default {
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