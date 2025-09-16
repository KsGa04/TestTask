//import { fileURLToPath, URL } from 'node:url';

//import { defineConfig } from 'vite';
//import plugin from '@vitejs/plugin-react';
//import fs from 'fs';
//import path from 'path';
//import child_process from 'child_process';
//import { env } from 'process';

//const baseFolder =
//    env.APPDATA !== undefined && env.APPDATA !== ''
//        ? `${env.APPDATA}/ASP.NET/https`
//        : `${env.HOME}/.aspnet/https`;

//const certificateName = "reactapp.client";
//const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
//const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

//if (!fs.existsSync(baseFolder)) {
//    fs.mkdirSync(baseFolder, { recursive: true });
//}

//if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
//    if (0 !== child_process.spawnSync('dotnet', [
//        'dev-certs',
//        'https',
//        '--export-path',
//        certFilePath,
//        '--format',
//        'Pem',
//        '--no-password',
//    ], { stdio: 'inherit', }).status) {
//        throw new Error("Could not create certificate.");
//    }
//}

//const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
//    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7079';

//// https://vitejs.dev/config/
//export default defineConfig({
//    plugins: [plugin()],
//    resolve: {
//        alias: {
//            '@': fileURLToPath(new URL('./src', import.meta.url))
//        }
//    },
//    server: {
//        proxy: {
//            '^/weatherforecast': {
//                target,
//                secure: false
//            }
//        },
//        port: parseInt(env.DEV_SERVER_PORT || '59546'),
//        https: {
//            key: fs.readFileSync(keyFilePath),
//            cert: fs.readFileSync(certFilePath),
//        }
//    }
//})
//import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react'

//export default defineConfig({
//    plugins: [react()],
//    server: {
//        port: 3000,
//        strictPort: true,
//        proxy: {
//            '/api': {
//                target: 'http://localhost:5006', // Используйте HTTP вместо HTTPS
//                changeOrigin: true,
//                secure: false,
//                rewrite: (path) => path.replace(/^\/api/, '/api')
//            }
//        }
//    }
//})
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