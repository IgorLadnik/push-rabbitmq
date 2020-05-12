import { IMessageBrokerFactory, IPublisher, IConsumer } from './infra/interfaces';
import { MessageBrokerFactory, Publisher, Consumer } from './infra/rabbitmqProvider';
import { Logger } from './infra/logger';
import { Config, Message } from './config/config';

interface ConsumerMap {
    [name: string]: IConsumer;
}

const logger = new Logger();
const connUrl = Config.messageBroker.connUrl;
const queueNames = Config.messageBroker.queueNames;
let messageBrokerFactory: IMessageBrokerFactory;
let consumers: ConsumerMap;

const createConsumers = async (messageBrokerFactory: IMessageBrokerFactory): Promise<ConsumerMap> => {
    let consumers: ConsumerMap = { };
    if (!messageBrokerFactory)
        return consumers;
       
    for (let i = 0; i < queueNames.length; i++)
        consumers[queueNames[i]] = await messageBrokerFactory.startConsumer(connUrl, queueNames[i], logger);

    return consumers;
}

(async function main() {
    const logger = new Logger();
    logger.log('consumerApp startd');
    
    messageBrokerFactory = new MessageBrokerFactory();
    consumers = await createConsumers(messageBrokerFactory);

    for (let i = 0; i < queueNames.length; i++) {
        const consumer = consumers[queueNames[i]];
        consumer.startConsume((msg: any) => {
            const jsonMessage = consumer.getJsonObject(msg);
            const queueName = consumer.getQueueName(msg);
            logger.log(`queue: ${queueName}, ${JSON.stringify(jsonMessage)}`);
        }, true, true);
    }   
})();


