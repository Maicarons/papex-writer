import type { WriterApi } from "../preload/index";

declare global {
  interface Window {
    writer: WriterApi;
  }
}

export {};
