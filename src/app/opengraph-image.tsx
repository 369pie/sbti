import { createSocialImageResponse, socialImageAlt, socialImageContentType, socialImageSize } from '@/lib/social-image';

export const dynamic = 'force-static';
export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function OpenGraphImage() {
  return createSocialImageResponse();
}