export class Config {
    static messageBroker = {
        connUrl: 'amqp://localhost',
        queueNames: ['q-01', 'q-02']
    };

    // static sqlServer = {
    //     host: 'IGORMAIN\\MSSQLSERVER01',
    //     databases: ['PetsDb']
    // };
}

export class Message {
    constructor(public id: number, public text: string) { }
}


