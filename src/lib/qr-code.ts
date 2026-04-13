type QrCodeModule = {
  toDataURL: (text: string, options?: unknown) => Promise<string>;
};

let qrCodePromise: Promise<QrCodeModule> | null = null;

async function getQrCodeModule(): Promise<QrCodeModule> {
  if (!qrCodePromise) {
    qrCodePromise = import('qrcode').then((module) => {
      const qrCode = module as unknown as Partial<QrCodeModule>;
      if (typeof qrCode.toDataURL !== 'function') {
        throw new Error('qrcode.toDataURL is unavailable');
      }
      return qrCode as QrCodeModule;
    });
  }

  return qrCodePromise;
}

export async function toQrDataUrl(text: string, options?: unknown) {
  const qrCode = await getQrCodeModule();
  return qrCode.toDataURL(text, options);
}