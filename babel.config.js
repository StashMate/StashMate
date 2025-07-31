module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        "env": [
          "EXPO_PUBLIC_GEMINI_API_KEY",
          "EXPO_PUBLIC_FMP_API_KEY"
        ]
      }]
    ]
  };
};