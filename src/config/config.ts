export class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        //queues: ['q-01', 'q-02', 'q-03']
    };
}

export class Message {
    constructor(public publisher: string, public id: number, public text: string) { }
}
