const Consumer = require('rabbitmq-provider/consumer').Consumer;
const utils = require('rabbitmq-provider/utils');
const Config = require('./config/config').Config;
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

let consumers;
let messages = { };

const createConsumers = async () => {
    let consumers = { };

    for (let i = 0; i < Config.numOfConsumers; i++) {
        //const queueNum = i % Config.messageBroker.queues.length;
        consumers[i] = await Consumer.createConsumer({
                connUrl: Config.messageBroker.connUrl,
                exchangeType: Config.messageBroker.exchangeType,
                exchange: Config.messageBroker.exchange,
                queue: Config.messageBroker.queues[0], //$queue-${uuidv4()}\`,
            },
            (thisConsumer, msg) => {
                if (!_.isNil(messages[thisConsumer.id]))
                    messages[thisConsumer.id] = [...messages[thisConsumer.id], msg];
            },
            msg => console.log(msg)
        );

        messages[consumers[i].id] = [];
    }

    return consumers;
}

async function main() {
    console.log('consumerApp started');

    consumers = await createConsumers();

    for (let i = 0; i < Config.numOfConsumers; i++)
        setInterval(() => fromRabbitMQ2Db(consumers[i], i), 5000);
}

let count = 10;

const fromRabbitMQ2Db = (consumer, k) => {
    if (_.isNil(consumer))
        return;

    setImmediate(() => {
        count--;

        const msgs = messages[consumer.id];
        if (msgs.length > 0) {
            let dbArr = [];
            utils.flatten(msgs).forEach(msg => {
                const payloads = utils.flatten(Consumer.getJsonObject(msg));
                const redelivered = msg.fields.redelivered;
                payloads.forEach(payload => {
                    dbArr = [...dbArr, {payload, redelivered}]
                });
            });

            const dbArrRedelivered = dbArr.filter(item => item.redelivered === true);

            //--------------------------------------------------------------------------
            // Write dbArr to database here

            dbArr.forEach(item =>
                console.log(`${consumer.id} ` +
                    `message: ${JSON.stringify(item.payload)}, redelivered = ${item.redelivered}`));

            //TEST ------------------------------------------------------------------
            if (count === 0) {
                consumer.stop();
                console.log(`STOPPED - ${consumer.id}`);
                for (let i = 0; i < Config.numOfConsumers; i++)
                    if (consumers[i].id === consumer.id) {
                        consumers[i] = null;
                        return;
                    }
            }
            //TEST ------------------------------------------------------------------

            //--------------------------------------------------------------------------

             messages[consumer.id].forEach(msg => consumer.ack(msg));
             messages[consumer.id] = [];
        }
    });
}

main()




