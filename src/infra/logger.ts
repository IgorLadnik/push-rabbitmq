import { ILogger } from "./ilogger";

//export function create(): ILogger { return new Logger(); }

export class Logger implements ILogger {
    log = (msg: string): void => console.log(`* ${msg}`);
}