class Logger {
  private shouldLog: boolean = false;

  public enableLogging() {
    this.shouldLog = true;
  }
  public log(...args: any[]) {
    if (!this.shouldLog) {
      return;
    }
    console.log(...args);
  }
}

export const logger = new Logger();
