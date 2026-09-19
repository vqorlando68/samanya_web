/**
 * Utilidad de resolución de URLs de Avatar
 * 
 * Resuelve URLs de avatares evitando restricciones de CORS/CORP impuestas por Google Drive:
 * 1. Si es ruta local (/uploads/...), se retorna directamente.
 * 2. Si es URL de Google Drive (lh3.googleusercontent.com o drive.google.com), se extrae el fileId
 *    y se redirige a través del proxy `/api/drive/foto/:fileId`.
 * 3. Si no existe, se retorna el avatar por defecto.
 */

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1594824813590-7815d9b68c2d?w=150&auto=format&fit=crop&q=80';

export function resolverAvatarUrl(avatarUrl?: string): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return DEFAULT_AVATAR;
  }

  const url = avatarUrl.trim();

  // Si ya es un asset local servido por la app
  if (url.startsWith('/uploads/') || url.startsWith('/')) {
    return url;
  }

  // Si es URL externa directa de Unsplash o CDN compatible
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Si contiene el hash conocido de popochito o archivo subido
  if (url.includes('27842950a090dfd62caa00788cab283a3a112305bde3599d8282036a02b2feba')) {
    return '/uploads/talento_humano/27842950a090dfd62caa00788cab283a3a112305bde3599d8282036a02b2feba.jpg';
  }

  // Si es un enlace de Google Drive (lh3 o drive.google.com)
  if (url.includes('googleusercontent.com') || url.includes('drive.google.com')) {
    // Buscar el ID en export=view&id=XYZ o /d/XYZ o id=XYZ
    const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
      return `/api/drive/foto/${match[1]}`;
    }
  }

  return url;
}
