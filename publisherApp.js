const Publisher = require('./infra/rabbitmq-provider/publisher').Publisher;
const Config = require('./config/config').Config;
const Message = require('./config/config').Message;
const Logger = require('./infra/logger').Logger;

const logger = new Logger();
let publishers;

const createPublishers = async () => {
    let publishers = { };

    for (let i = 0; i < Config.numOfPublishers; i++)
        publishers[i] = await Publisher.createPublisher({
            connUrl: Config.messageBroker.connUrl,
            exchange: Config.messageBroker.exchange,
            queue: '',
            exchangeType: Config.messageBroker.exchangeType,
            durable: true,
            persistent: true
        }, logger);

    return publishers;
}

delay = (duration) =>
    new Promise(resolve =>
        setTimeout(() => {
            resolve();
            //logger?.log(`delay for ${duration} ms`);
        }, duration)
);

(async function main() {
    const logger = new Logger();
    logger.log('publisherApp started');

    publishers = await createPublishers();

    let count = 0;

    setInterval(async () => {
        for (let i = 0; i < Config.numOfPublishers; i++) {
            const publisher = publishers[i];
            publisher.publish(new Message(publisher.id, ++count, `text${count}`));
            await delay(1);
        }
    }, 500);
})();



