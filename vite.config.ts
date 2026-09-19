import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { spawn } from 'child_process';

function samanyaApiPlugin(): Plugin {
  return {
    name: 'samanya-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/drive/subir-foto-talento') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const py = spawn('python', ['backend/drive_upload.py']);
              let stdout = '';
              let stderr = '';

              py.stdout.on('data', (d) => {
                stdout += d.toString();
              });
              py.stderr.on('data', (d) => {
                stderr += d.toString();
              });

              py.on('close', (code) => {
                res.setHeader('Content-Type', 'application/json');
                if (code !== 0 && !stdout.trim()) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: stderr || 'Error ejecutando backend/drive_upload.py' }));
                } else {
                  res.statusCode = 200;
                  res.end(stdout.trim());
                }
              });

              py.stdin.write(body);
              py.stdin.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/drive/foto/')) {
          const fileId = req.url.split('/api/drive/foto/')[1]?.split('?')[0];
          if (!fileId) {
            res.statusCode = 400;
            res.end('Missing fileId');
            return;
          }
          const py = spawn('python', ['backend/drive_upload.py', '--get-photo', fileId]);
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          py.stdout.pipe(res);
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    samanyaApiPlugin()
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
