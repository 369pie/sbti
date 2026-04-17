import { withBasePath } from './site';

function normalizeApiPath(path: string): string {
  if (!path) return '/api';
  if (path.startsWith('/api')) return path;
  return `/api${path.startsWith('/') ? path : `/${path}`}`;
}

export function getApiPath(path: string): string {
  return withBasePath(normalizeApiPath(path));
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  const body = (await response.text()).trim();
  const looksLikeHtml = body.startsWith('<!DOCTYPE') || body.startsWith('<html') || body.startsWith('<');

  if (looksLikeHtml) {
    throw new Error(
      `接口返回了 HTML 页面（HTTP ${response.status}），通常表示请求打到了错误地址，或当前部署没有提供该 API。`
    );
  }

  throw new Error(`接口返回了非 JSON 内容（HTTP ${response.status}）。`);
}
