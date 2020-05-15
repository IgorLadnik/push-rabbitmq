import { Consumer } from './infra/rabbitmqProvider';
import { Logger } from './infra/logger';
import { Config } from './config/config';

interface ConsumerMap {
    [name: string]: Consumer;
}

const logger = new Logger();
let consumers: ConsumerMap;

const createConsumers = async (): Promise<ConsumerMap> => {
    let consumers: ConsumerMap = { };

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

    const promises = new Array<Promise<Consumer>>();
    for (let i = 0; i < Config.numOfConsumers; i++) {
        const consumer = consumers[i];
        promises.push(consumer.startConsume((msg: any, jsonPayload: any) => {
            logger.log(`consumer: ${consumer.id}, exchange: ${msg.fields.exchange}, ` +
                       `queue: ${msg.fields.routingKey}, message: ${JSON.stringify(jsonPayload)}`);
        }));
    }

    await Promise.all(promises);
})();


