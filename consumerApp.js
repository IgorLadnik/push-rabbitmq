const Consumer = require('./infra/rabbitmqProvider').Consumer;
const Logger = require('./infra/logger').Logger;
const Config = require('./config/config').Config;

// interface ConsumerMap {
//     [name: string]: Consumer;
// }

const logger = new Logger();
let consumers;

const createConsumers = async () => {
    let consumers = { };

    for (let i = 0; i < Config.numOfConsumers; i++)
        consumers[i] = await Consumer.createConsumer({
            connUrl: Config.messageBroker.connUrl,
            exchange: Config.messageBroker.exchange,
            queue: Config.messageBroker.queues[i] || '',
            exchangeType: Config.messageBroker.exchangeType,
            durable: true,
            noAck: true
        }, logger);

    return consumers;
}

(async function main() {
    const logger = new Logger();
    logger.log('consumerApp started');
    
    consumers = await createConsumers();

    const promises = [];
    for (let i = 0; i < Config.numOfConsumers; i++) {
        const consumer = consumers[i];
        promises.push(consumer.startConsume((msg, jsonPayload) => {
            logger.log(`consumer: ${consumer.id}, exchange: ${msg.fields.exchange}, ` +
                       `queue: ${msg.fields.routingKey}, message: ${JSON.stringify(jsonPayload)}`);
        }));
    }

    await Promise.all(promises);
})();


