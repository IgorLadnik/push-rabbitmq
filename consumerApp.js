const Consumer = require('./infra/rabbitmqProvider').Consumer;
const Logger = require('./infra/logger').Logger;
const Config = require('./config/config').Config;

const logger = new Logger();
let consumers;

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
        }, logger);
    }

    return consumers;
}

(async function main() {
    const logger = new Logger();
    logger.log('consumerApp started');

    // let lastPublishedId = { };
    // let disorder = { };
    //
    // for (let i = 0; i < Config.numOfConsumers; i++) {
    //     lastPublishedId[i] = -1;
    //     disorder[i] = 0;
    // }

    consumers = await createConsumers();

    for (let i = 0; i < Config.numOfConsumers; i++) {
        const consumer = consumers[i];
        await consumer.startConsume((msg, jsonPayload, queue) => {
            logger.log(`consumer: ${consumer.id}, exchange: ${msg.fields.exchange}, ` +
                       `routingKey: ${msg.fields.routingKey}, queue: ${queue}, ` + 
                       `message: ${JSON.stringify(jsonPayload)}`);

            // const messageId = parseInt(jsonPayload.id);
            // if (messageId !== lastPublishedId[i] + 1 && lastPublishedId[i] > -1)
            //     // Disorder case
            //     logger.log(`WRONG ORDER in ${consumer.id} consumer: ${++disorder[i]}`);
            //
            //     lastPublishedId[i] = messageId;
        });
    }
})();


