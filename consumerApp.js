const Consumer = require('rabbitmq-provider/consumer').Consumer;
const Config = require('./config/config').Config;
const _ = require('lodash');
//const { v4: uuidv4 } = require('uuid');

class Logger {
    log = (msg) => console.log(msg);
}

const createConsumers = async () => {
    let consumers = [];

    for (let i = 0; i < Config.numOfConsumers; i++) {
        consumers[i] = await Consumer.createConsumer({
                connUrl: Config.messageBroker.connUrl,
                exchangeType: Config.messageBroker.exchangeType,
                exchange: Config.messageBroker.exchange,
                queue: Config.messageBroker.queue
            },
            new Logger()
        );
    }

    return consumers;
}

let count = 10;

(async function main() {
    console.log('consumerApp started');

    const consumers = await createConsumers();
    for (let i = 0; i < consumers.length; i++) {
        consumers[i].startProcessChunks(events => {
            if (i === 0) {
                if (--count === 0) {
                    console.log('\n\nEXCEPTION\n\n');
                    consumers[i].stop();
                    throw 'EXCEPTION';
                }
            }
        }, 5000);
    }
})();




