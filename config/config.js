module.exports.Config = class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        exchange: 'direct-notification',
        exchangeType: 'direct',
        queues: ['q-01', 'q-02']
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
