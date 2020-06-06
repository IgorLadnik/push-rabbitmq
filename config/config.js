module.exports.Config = class Config {
    static messageBroker = {
        connUrl: 'amqp://guest:1237@localhost:5672',
        exchange: 'exchange-direct-notification',
        exchangeType: 'direct',
        queue: 'queue-service-01'
    };

    static numOfPublishers = 2;
    static numOfConsumers  = 5;
}

module.exports.Message = class Message {
    constructor(publisher, id, text) {
        this.publisher = publisher;
        this.id = id;
        this.text = text;
    }
}
