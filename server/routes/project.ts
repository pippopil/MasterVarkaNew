import { Router, Request, Response } from 'express';
import path from 'path';
import { execFile } from 'child_process';

export function createProjectRouter(rootDir: string): Router {
  const router = Router();

  // Скачивание архива с исходным кодом проекта (только для режима разработки)
  router.get('/download-zip', (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROJECT_DOWNLOAD) {
      return res.status(403).json({ error: 'Скачивание полного архива отключено в целях безопасности' });
    }
    const outputPath = '/tmp/mastervarka-source.zip';
    const scriptPath = path.resolve(rootDir, 'scripts', 'export_zip.py');

    execFile('python3', [scriptPath, outputPath], (error) => {
      if (error) {
        console.error('Failed to create project zip:', error);
        return res.status(500).json({ error: 'Failed to create zip archive' });
      }
      res.download(outputPath, 'mastervarka-source.zip', (err) => {
        if (err) {
          console.error('Error sending zip file:', err);
        }
      });
    });
  });

  return router;
}
