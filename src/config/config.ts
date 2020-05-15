export class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        exchange: 'notification',
        exchangeType: 'fanout',
        queues: [] //['q-01', 'q-02', 'q-03']
    };

    static readonly numOfPublishers = 2;
    static readonly numOfConsumers  = 3;
}

export class Message {
    constructor(public publisher: string, public id: number, public text: string) { }
}
