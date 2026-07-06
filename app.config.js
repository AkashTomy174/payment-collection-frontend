module.exports = {
  expo: {
    name: "Payment Collection",
    slug: "payment-collection",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    android: {
      package: "com.akashtomy.paymentcollection",
    },
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000",
      buildId:
        process.env.EXPO_PUBLIC_BUILD_ID ||
        process.env.EAS_BUILD_GIT_COMMIT_HASH?.slice(0, 7) ||
        process.env.GITHUB_SHA?.slice(0, 7) ||
        "local",
      eas: {
        projectId: "de527a88-1742-404e-b722-6ad132380c38",
      },
    },
  },
};
