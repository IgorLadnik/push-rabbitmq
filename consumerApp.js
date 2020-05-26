const Consumer = require('rabbitmq-provider/consumer').Consumer;
const Logger = require('rabbitmq-provider/logger').Logger;
const Config = require('./config/config').Config;

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

(async function main() {
    const logger = new Logger();
    logger.log('consumerApp started');

    const consumers = await createConsumers();

    for (let i = 0; i < Config.numOfConsumers; i++) {
        const consumer = consumers[i];
        await consumer.startConsume((msg, jsonPayload, queue) => {
            logger.log(`consumer: ${consumer.id}, exchange: ${msg.fields.exchange}, ` +
                       `routingKey: ${msg.fields.routingKey}, queue: ${queue}, ` + 
                       `message: ${JSON.stringify(jsonPayload)}`);
        });
    }
})();


