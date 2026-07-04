module.exports = {
  expo: {
    name: "Payment Collection",
    slug: "payment-collection",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000",
    },
  },
};
