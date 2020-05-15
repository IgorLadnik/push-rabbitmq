const Publisher = require('./infra/rabbitmqProvider').Publisher;
const Logger = require('./infra/logger').Logger;
const Config = require('./config/config').Config;
const Message = require('./config/config').Message;

// interface PublisherMap {
//     [name: string]: Publisher;
// }

const logger = new Logger();
let publishers;

const createPublishers = async () => {
    let publishers = { };

    for (let i = 0; i < Config.numOfPublishers; i++)
        publishers[i] = await Publisher.createPublisher({
            connUrl: Config.messageBroker.connUrl,
            exchange: Config.messageBroker.exchange,
            queue: Config.messageBroker.queues[i] || '',
            exchangeType: Config.messageBroker.exchangeType,
            durable: true,
            persistent: false
        }, logger);

    return publishers;
}

(async function main() {
    const logger = new Logger();
    logger.log('publisherApp started');

    publishers = await createPublishers();

    let count = 0;

    setInterval(() => {
        for (let i = 0; i < Config.numOfPublishers; i++) {
            const publisher = publishers[i];
            publisher.publish(new Message(publisher.id, ++count, `text${count}`));
        }
    }, 1000);
})();



