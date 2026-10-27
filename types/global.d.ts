export {};

declare global {
  interface Window {
    Cookiebot?: {
      consent: {
        necessary: boolean;
        preferences: boolean;
        statistics: boolean;
        marketing: boolean;
        method: string | null;
      };
      consented: boolean;
      declined: boolean;
      hasResponse: boolean;
    };
    dataLayer?: unknown[];
    google_tag_manager?: Record<string, unknown>;
  }
}
