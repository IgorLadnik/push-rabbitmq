module.exports.Config = class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        exchange: 'exchange-direct-notification',
        exchangeType: 'direct',
        queues: ['queue-service-01', 'queue-service-02']
    };

    static numOfPublishers = 2;
    static numOfConsumers  = 6;
}

module.exports.Message = class Message {
    publisher;
    id;
    text;

    constructor(publisher, id, text) {
        this.publisher = publisher;
        this.id = id;
        this.text = text;
    }
}
