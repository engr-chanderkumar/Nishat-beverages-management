/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-blue': '#0D47A1',
                'brand-lightblue': '#1976D2',
                'brand-accent': '#29B6F6',
                'brand-bg': '#F4F7FC',
                'brand-surface': '#FFFFFF',
                'brand-text-primary': '#1A202C',
                'brand-text-secondary': '#4A5568',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}