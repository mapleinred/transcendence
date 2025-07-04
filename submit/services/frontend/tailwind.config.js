/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",                          // Include index.html
        "./src/**/*.{html,js,ts,jsx,tsx}"      // Include all HTML, JS, TS, JSX, and TSX files in the src folder
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    important: true
};
