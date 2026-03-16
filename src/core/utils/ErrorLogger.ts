export class ErrorLogger {
  static critical(message: string, error?: unknown): void {
    console.error(`[CRITICAL ERROR]: ${message}`, error);
  }

  static warn(message: string, error?: unknown): void {
    console.warn(`[WARNING]: ${message}`, error);
  }

  static info(message: string, data?: unknown): void {
    console.info(`[INFO]: ${message}`, data);
  }
}