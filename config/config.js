module.exports.Config = class Config {
    static messageBroker = {
        connUrl: 'amqp://guest:1237@localhost:5672',
        exchange: 'exchange-direct-notification',
        exchangeType: 'direct',
        queues: ['queue-service-01']
    };

    static numOfPublishers = 1;
    static numOfConsumers  = 2;
}

module.exports.Message = class Message {
    constructor(publisher, id, text) {
        this.publisher = publisher;
        this.id = id;
        this.text = text;
    }
}
