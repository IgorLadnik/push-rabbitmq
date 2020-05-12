import { ILogger } from "./ilogger";
import { IMessageBrokerFactory, IPublisher, IConsumer } from './interfaces';
let amqp = require('amqplib');

//export function create(): IMessageBrokerFactory { return new MessageBrokerFactory(); }

export class MessageBrokerFactory implements IMessageBrokerFactory {
    async startPublisher(connUrl: string, queueName: string, persistent: boolean, shouldPurge: boolean,
                         l: ILogger): Promise<IPublisher> {
        const publisher = new Publisher(connUrl, queueName, persistent, shouldPurge, l);
        try {
            await publisher.createChannel();
        }
        catch (err) {
            l.log(err);
        }

        if (shouldPurge)
            await publisher.purge();

        return publisher;
    }

    async startConsumer(connUrl: string, queueName: string, l: ILogger): Promise<IConsumer> {
        const consumer = new Consumer(connUrl, queueName, l);
        try {
            await consumer.createChannel();
        }
        catch (err) {
            l.log(err);
        }

        return consumer;
    }
}

export class Connection {
    channel: any; 
    l: ILogger;

    constructor(public connUrl: string, l :ILogger) {
        this.l = l;
    }

    async connect(): Promise<void> {
        try {
            return await amqp.connect(this.connUrl);
        }
        catch (err) {
            this.l.log(err);
        }
    }
}

export class Publisher extends Connection implements IPublisher {
    constructor(public connUrl: string, public queueName: string, 
                public persistent: boolean, public shouldPurge: boolean, l :ILogger) {
        super(connUrl, l);
    }

    async createChannel(): Promise<Publisher> {
        let conn: any = await super.connect();
        try {
            this.channel = await conn.createConfirmChannel();
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }

    private async publishOneAny(content: any): Promise<void> {
        const persistent = this.persistent;
        try {
            await this.channel.sendToQueue(this.queueName, content, { persistent });
        }
        catch (err) {
            this.l.log(err);
        }
    }

    private async publishOne<T>(t: T): Promise<void> {
        await this.publishOneAny(Buffer.from(JSON.stringify(t)));
    }

    async publish<T>(...arrT: Array<T>): Promise<void> {
        let promises = new Array<Promise<void>>();
        for (let i = 0; i < arrT.length; i++)
            promises.push(this.publishOne<T>(arrT[i]));

        await Promise.all(promises);
    }

    async purge(): Promise<void> {
        try {
            await this.channel.purgeQueue(this.queueName);
        }
        catch (err) {
            this.l.log(err);
        }
    }
}

export class Consumer extends Connection implements IConsumer {
    constructor(public connUrl: string, public queueName: string, l: ILogger) {
        super(connUrl, l);
    }
    
    async createChannel(): Promise<Consumer> {
        let conn: any = await super.connect();
        try {
            this.channel = await conn.createChannel();
            await this.channel.prefetch();
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }

    async startConsume(processCallback: Function, durable: boolean, noAck: boolean)
                : Promise<Consumer> {
        try {
            await this.channel.assertQueue(this.queueName, { durable });
            await this.channel.consume(this.queueName, processCallback, { noAck });
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }
}