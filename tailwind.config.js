// /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust the paths based on your project structure
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a202c', // Replace with your desired color value
      },
    },
  },
  plugins: [],
}