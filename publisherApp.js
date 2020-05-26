const Publisher = require('rabbitmq-provider/publisher').Publisher;
const Logger = require('rabbitmq-provider/logger').Logger;
const Config = require('./config/config').Config;
const Message = require('./config/config').Message;

const createPublishers = async () => {
    const publishers = { };

    for (let i = 0; i < Config.numOfPublishers; i++)
        publishers[i] = await Publisher.createPublisher({
            connUrl: Config.messageBroker.connUrl,
            exchange: Config.messageBroker.exchange,
            queue: '',
            exchangeType: Config.messageBroker.exchangeType,
            durable: true,
            persistent: true
        });

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

    const publishers = await createPublishers();

    let count = 0;

    setInterval(async () => {
        for (let i = 0; i < Config.numOfPublishers; i++) {
            const publisher = publishers[i];

            const arr = [];
            for (let j = 0; j < 3; j++)
                arr.push(new Message(publisher.id, ++count, `text${count}`));

            publisher.publish(arr);
            await delay(1);
        }
    }, 500);
})();



