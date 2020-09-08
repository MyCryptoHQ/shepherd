declare class Logger {
    private shouldLog;
    enableLogging(): void;
    log(...args: any[]): void;
}
export declare const logger: Logger;
export {};
