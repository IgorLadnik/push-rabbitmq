import { ILogger } from "./ilogger";

export interface IMessageBrokerFactory {
    startPublisher(connUrl: string, queueName: string, persistent: boolean, shouldPurge: boolean, l: ILogger): Promise<IPublisher>;
    startConsumer(connUrl: string, queueName: string, l: ILogger): Promise<IConsumer>;
}

export interface IPublisher {
    publish<T>(...arrT: Array<T>): Promise<void>;
}

export interface IConsumer {
    startConsume(processCallback: Function, durable: boolean, noAck: boolean): Promise<IConsumer>;
    getJsonObject(msg: any): any;
    getQueueName(msg: any): string;
}
