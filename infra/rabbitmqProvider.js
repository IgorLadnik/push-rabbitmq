const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');

exports.PublisherOptions = class PublisherOptions {
    connUrl;
    exchange;
    queue;
    exchangeType;
    durable;
    persistent;
}

exports.ConsumerOptions = class ConsumerOptions {
    connUrl;
    exchange;
    queue;
    exchangeType;
    durable;
    noAck;
}

class Connection {
    connUrl;
    channel;
    l;

    constructor(connUrl, l) {
        this.connUrl = connUrl;
        this.l = l;
    }

    async connect() {
        try {
            return await amqp.connect(this.connUrl);
        }
        catch (err) {
            this.l.log(`Error in RabbitMQ Connection, \"Connection.connect()\", connUrl = \"${this.connUrl}\": ${err}`);
        }
    }

    async createChannelConnection() {
        let conn = await this.connect();
        try {
            this.channel = await conn.createChannel();
        }
        catch (err) {
            this.l.log(`Error in RabbitMQ Connection, \"Connection.createChannelConnection()\": ${err}`);
        }
    }
}

exports.Publisher = class Publisher extends Connection {
    id;
    po;

    static createPublisher = async (po, l) =>
        await new Publisher(po, l).createChannel();

    constructor(po, l) {
        super(po.connUrl, l);
        this.id = `publisher-${uuidv4()}`;
        this.po = po;
    }

    async createChannel() {
        await this.createChannelConnection();
        return this;
    }

    async publishOne(t) {
        try {
            await this.channel.publish(this.po.exchange, this.po.queue, Buffer.from(JSON.stringify(t)));
        }
        catch (err) {
            this.l.log(`Error in RabbitMQ Publisher, \"Publisher.publishOne()\": ${err}`);
        }
    }

    async publish(...arrT) {
        let promises = [];
        for (let i = 0; i < arrT.length; i++)
            promises.push(this.publishOne(arrT[i]));

        await Promise.all(promises);
    }

    // async purge() {
    //     try {
    //         await this.channel.purgeQueue(this.po.queue);
    //     }
    //     catch (err) {
    //         this.l.log(err);
    //     }
    // }
}

exports.Consumer = class Consumer extends Connection {
    id;
    co;
    isExchange;

    static createConsumer = async (co, l) =>
        await new Consumer(co, l).createChannel();

    constructor(co, l) {
        super(co.connUrl, l);
        this.id = `consumer-${uuidv4()}`;
        this.co = co;
        this.isExchange = co.exchange.length > 0 && co.exchangeType.length > 0;
    }

    async createChannel() {
        await this.createChannelConnection();
        return this;
    }
    
    async startConsume(consumerFn) {
        try {
            if (this.isExchange)
                await this.channel.assertExchange(this.co.exchange, this.co.exchangeType, { durable: this.co.durable });

            await this.channel.assertQueue(this.co.queue, { durable: this.co.durable });

            if (this.isExchange)
                await this.channel.bindQueue(this.co.queue, this.co.exchange, '');

            await this.channel.consume(this.co.queue,
                (msg) => {
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

    static getJsonObject = (msg) => JSON.parse(`${msg.content}`);
}



