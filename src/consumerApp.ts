import { Consumer } from './infra/rabbitmqProvider';
import { Logger } from './infra/logger';
import { Config, Message } from './config/config';

interface ConsumerMap {
    [name: string]: Consumer;
}

const logger = new Logger();
const connUrl = Config.messageBroker.connUrl;
//const queues = Config.messageBroker.queues;
const numOfConsumers = 3;
let consumers: ConsumerMap;

const createConsumers = async (): Promise<ConsumerMap> => {
    let consumers: ConsumerMap = { };

    for (let i = 0; i < numOfConsumers; i++)
        consumers[i] = await Consumer.createConsumer({
            connUrl,
            exchange: 'notification',
            queue: ''/*queues[i]*/,
            exchangeType: 'fanout',
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
    for (let i = 0; i < numOfConsumers; i++) {
        const consumer = consumers[i];
        promises.push(consumer.startConsume((msg: any) => {
            const jsonMessage = consumer.getJsonObject(msg);
            logger.log(`consumer: ${consumer.id}, exchange: ${msg.fields.exchange}, ` +
                       `queue: ${msg.fields.routingKey}, message: ${JSON.stringify(jsonMessage)}`);
        }));
    }

    await Promise.all(promises);
})();


