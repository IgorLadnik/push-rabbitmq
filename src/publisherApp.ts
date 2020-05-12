import { IMessageBrokerFactory, IPublisher, IConsumer } from './infra/interfaces';
import { MessageBrokerFactory, Publisher, Consumer } from './infra/rabbitmqProvider';
import { Logger } from './infra/logger';
import { Config, Message } from './config/config';

interface PublisherMap {
    [name: string]: IPublisher;
}

const logger = new Logger();
const connUrl = Config.messageBroker.connUrl;
const queueNames = Config.messageBroker.queueNames;
let messageBrokerFactory: IMessageBrokerFactory;
let publishers: PublisherMap;

const createPublishers = async (messageBrokerFactory: IMessageBrokerFactory): Promise<PublisherMap> => {
    let publishers: PublisherMap = { };
    if (!messageBrokerFactory)
        return publishers;
       
    for (let i = 0; i < queueNames.length; i++)
        publishers[queueNames[i]] = await messageBrokerFactory.startPublisher(connUrl, queueNames[i], false, false, logger);

    return publishers;
}

(async function main() {
    const logger = new Logger();
    logger.log('publisherApp startd');

    messageBrokerFactory = new MessageBrokerFactory();
    publishers = await createPublishers(messageBrokerFactory);

    publishers[queueNames[0]].publish<Message>(
        new Message(1, "text1"),
        new Message(2, "text2"),
    );
})();



