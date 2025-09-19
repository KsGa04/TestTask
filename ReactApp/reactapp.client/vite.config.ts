import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],

    // Базовый путь для публикации
    base: './',

    server: {
        // Порт для разработки
        port: 3000,
        // Строго использовать указанный порт
        strictPort: true,

        // Автоматически открывать браузер
        open: true,

        // Настройка прокси для API запросов
        proxy: {
            '/api': {
                target: 'http://localhost:5006',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        },

        // Настройки CORS для разработки
        cors: true,

        // Явно задаем хост для доступа с других устройств
        host: true
    },

    // Настройки сборки
    build: {
        // Целевая версия ES
        target: 'esnext',

        // Исходные карты для отладки
        sourcemap: true,

        // Минификация кода
        minify: false,

        // Настройки chunk'ов
        rollupOptions: {
            output: {
                manualChunks: {
                    // Разделение кода на чанки
                    vendor: ['react', 'react-dom'],
                    redux: ['@reduxjs/toolkit', 'react-redux'], // Исправлена опечатка: @reduxjs/toolkit
                },
                // Убедимся, что имена файлов содержат только ASCII символы
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },

        // Настройки размера чанков
        chunkSizeWarningLimit: 1000,
    },

    // Настройки разрешений модулей
    resolve: {
        alias: {
            // Псевдонимы для путей
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@store': resolve(__dirname, 'src/store'),
            '@api': resolve(__dirname, 'src/api'),
            '@types': resolve(__dirname, 'src/types'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },

    // Настройки CSS
    css: {
        // Настройки для CSS модулей
        modules: {
            localsConvention: 'camelCase'
        },

        // PostCSS конфигурация (если нужно)
        postcss: {
            plugins: []
        }
    },

    // Настройки предпросмотра
    preview: {
        port: 3000,
        strictPort: true,
    },

    // Оптимизации для продакшена
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    }
})