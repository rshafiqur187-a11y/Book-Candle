export const BACKEND_URL = 'https://ais-dev-gzcm5bswlt2yvgf25lcl3g-682355404403.asia-southeast1.run.app';

export const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/api/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
};
