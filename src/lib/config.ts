export const BACKEND_URL = 'https://ais-dev-gzcm5bswlt2yvgf25lcl3g-682355404403.asia-southeast1.run.app';

export const getMediaUrl = (url: string) => {
  if (!url) return '';
  
  // Handle Google Drive links
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  
  if (url.startsWith('/api/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
};
