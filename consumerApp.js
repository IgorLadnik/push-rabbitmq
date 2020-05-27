const Consumer = require('rabbitmq-provider/consumer').Consumer;
const Logger = require('rabbitmq-provider/logger').Logger;
const Config = require('./config/config').Config;
const _ = require('lodash');

const logger = new Logger();

const createConsumers = async () => {
    let consumers = { };

    for (let i = 0; i < Config.numOfConsumers; i++) {
        const queueNum = i % Config.messageBroker.queues.length;
        consumers[i] = await Consumer.createConsumer({
            connUrl: Config.messageBroker.connUrl,
            exchange: Config.messageBroker.exchange,
            queue: Config.messageBroker.queues[queueNum],
            exchangeType: Config.messageBroker.exchangeType,
            durable: true,
            noAck: true
        });
    }

    return consumers;
}

async function main() {
    logger.log('consumerApp started');

    const consumers = await createConsumers();

    setInterval(() => fromRabbitMQ2Db(), 1000);

    for (let i = 0; i < Config.numOfConsumers; i++) {
        const consumer = consumers[i];
        await consumer.startConsume((msg, jsonPayload, queue) =>
            consumerCallback(msg, jsonPayload, queue, consumer.id));
    }
}

let messages = [];

const consumerCallback = (msg, jsonPayload, queue, consumerId) => {
    logger.log(`consumer: ${consumerId}, exchange: ${msg.fields.exchange}, ` +
        `routingKey: ${msg.fields.routingKey}, queue: ${queue}, ` +
        `message: ${JSON.stringify(jsonPayload)}`);

    if (queue === Config.messageBroker.queues[0]) {
        messages.push(jsonPayload);
    }
}

const fromRabbitMQ2Db = () => {
    if (messages.length > 0) {
        const dbArr = _.flatten(messages);
        messages = [];

        // Write dbArr to database here, perhaps with setImmediate()
    }
}

main()




