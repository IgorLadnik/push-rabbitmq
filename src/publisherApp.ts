import { Publisher } from './infra/rabbitmqProvider';
import { Logger } from './infra/logger';
import { Config, Message } from './config/config';

interface PublisherMap {
    [name: string]: Publisher;
}

const logger = new Logger();
const connUrl = Config.messageBroker.connUrl;
//const queues = Config.messageBroker.queues;
const numOfPublishers = 2;
let publishers: PublisherMap;

const createPublishers = async (): Promise<PublisherMap> => {
    let publishers: PublisherMap = { };

    for (let i = 0; i < numOfPublishers; i++)
        publishers[i] = await new Publisher({
            connUrl,
            exchange: 'notification',
            queue: '',
            exchangeType: 'fanout',
            durable: true,
            persistent: false
        }, logger).createChannel();

    return publishers;
}

(async function main() {
    const logger = new Logger();
    logger.log('publisherApp started');

    publishers = await createPublishers();

    for (let i = 0; i < numOfPublishers; i++) {
        const publisher = publishers[i];
        publisher.publish<Message>(
            new Message(publisher.id, 1, "text1"),
            new Message(publisher.id, 2, "text2"),
        );
    }
})();



