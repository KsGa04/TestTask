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
//                target: 'http://localhost:5006', // ����������� HTTP ������ HTTPS
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

    // ������� ���� ��� ����������
    base: './',

    server: {
        // ���� ��� ����������
        port: 3000,
        // ������ ������������ ��������� ����
        strictPort: true,

        // ������������� ��������� �������
        open: true,

        // ��������� ������ ��� API ��������
        proxy: {
            '/api': {
                target: 'http://localhost:5006',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        },

        // ��������� CORS ��� ����������
        cors: true,

        // ���� ������ ���� ��� ������� � ������ ���������
        host: true
    },

    // ��������� ������
    build: {
        // ������� ������ ES
        target: 'esnext',

        // �������� ����� ��� �������
        sourcemap: true,

        // ����������� ����
        minify: false,

        // ��������� chunk'��
        rollupOptions: {
            output: {
                manualChunks: {
                    // ���������� ���� �� �����
                    vendor: ['react', 'react-dom'],
                    redux: ['@reduxjs/toolkit', 'react-redux'], // ���������� ��������: @reduxjs/toolkit
                },
                // ��������, ��� ����� ������ �������� ������ ASCII �������
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },

        // ��������� ������� ������
        chunkSizeWarningLimit: 1000,
    },

    // ��������� ���������� �������
    resolve: {
        alias: {
            // ���������� ��� �����
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@store': resolve(__dirname, 'src/store'),
            '@api': resolve(__dirname, 'src/api'),
            '@types': resolve(__dirname, 'src/types'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },

    // ��������� CSS
    css: {
        // ��������� ��� CSS �������
        modules: {
            localsConvention: 'camelCase'
        },

        // PostCSS ������������ (���� �����)
        postcss: {
            plugins: []
        }
    },

    // ��������� �������������
    preview: {
        port: 3000,
        strictPort: true,
    },

    // ����������� ��� ����������
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    }
})