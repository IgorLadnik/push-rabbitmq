import { v4 as uuidv4 } from 'uuid';
import { ILogger } from './ilogger';
const amqp = require('amqplib');

export class PublisherOptions {
    connUrl: string;
    exchange: string;
    queue: string;
    exchangeType: string;
    durable: boolean;
    persistent: boolean;
}

export class ConsumerOptions {
    connUrl: string;
    exchange: string;
    queue: string;
    exchangeType: string;
    durable: boolean;
    noAck: boolean;
}

export interface ConsumerFunction {
    (msg: any, jsonPayload: any): void;
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
            this.l.log(`Error in RabbitMQ Connection, \"Connection.connect()\", connUrl = \"${this.connUrl}\": ${err}`);
        }
    }

    async createChannelConnection(): Promise<void> {
        let conn: any = await this.connect();
        try {
            this.channel = await conn.createChannel();
        }
        catch (err) {
            this.l.log(`Error in RabbitMQ Connection, \"Connection.createChannelConnection()\": ${err}`);
        }
    }
}

export class Publisher extends Connection {
    id: string;

    static createPublisher = async (po: PublisherOptions, l :ILogger): Promise<Publisher> =>
        await new Publisher(po, l).createChannel();

    constructor(private po: PublisherOptions, l :ILogger) {
        super(po.connUrl, l);
        this.id = `publisher-${uuidv4()}`;
    }

    async createChannel(): Promise<Publisher> {
        await this.createChannelConnection();
        return this;
    }

    private async publishOne<T>(t: T): Promise<void> {
        try {
            await this.channel.publish(this.po.exchange, this.po.queue, Buffer.from(JSON.stringify(t)));
        }
        catch (err) {
            this.l.log(`Error in RabbitMQ Publisher, \"Publisher.publishOne()\": ${err}`);
        }
    }

    async publish<T>(...arrT: Array<T>): Promise<void> {
        let promises = new Array<Promise<void>>();
        for (let i = 0; i < arrT.length; i++)
            promises.push(this.publishOne<T>(arrT[i]));

        await Promise.all(promises);
    }

    // async purge(): Promise<void> {
    //     try {
    //         await this.channel.purgeQueue(this.po.queue);
    //     }
    //     catch (err) {
    //         this.l.log(err);
    //     }
    // }
}

export class Consumer extends Connection {
    id: string;
    isExchange = false;

    static createConsumer = async (co: ConsumerOptions, l :ILogger) =>
        await new Consumer(co, l).createChannel();

    constructor(private co: ConsumerOptions, l: ILogger) {
        super(co.connUrl, l);
        this.id = `consumer-${uuidv4()}`;
        this.isExchange = co.exchange?.length > 0 && co.exchangeType?.length > 0;
    }

    async createChannel(): Promise<Consumer> {
        await this.createChannelConnection();
        return this;
    }
    
    async startConsume(consumerFn: ConsumerFunction): Promise<Consumer> {
        try {
            if (this.isExchange)
                await this.channel.assertExchange(this.co.exchange, this.co.exchangeType, { durable: this.co.durable });

            await this.channel.assertQueue(this.co.queue, { durable: this.co.durable });

            if (this.isExchange)
                await this.channel.bindQueue(this.co.queue, this.co.exchange, '');

            await this.channel.consume(this.co.queue,
                (msg: any) => {
                    try {
                        consumerFn(msg, Consumer.getJsonObject(msg));
                    }
                    catch (err) {
                        this.l.log(`Error in RabbitMQ Consumer, a consumer supplied callback: ${err}`);
                    }
                },
                { noAck: this.co.noAck });
        }
        catch (err) {
            this.l.log(`Error in Error in RabbitMQ Consumer, \"Consumer.startConsume()\": ${err}`);
        }

        return this;
    }

    static getJsonObject = (msg: any) => JSON.parse(`${msg.content}`);
}