module.exports.Config = class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        exchange: 'notification',
        exchangeType: 'fanout',
        queues: [] //['q-01', 'q-02', 'q-03']
    };

    static numOfPublishers = 2;
    static numOfConsumers  = 3;
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
