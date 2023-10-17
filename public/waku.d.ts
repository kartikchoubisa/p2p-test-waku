export declare enum remotePeerDomains {
    HK = "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm",
    SL_SG = "/dns4/nwaku.silent.sg/tcp/8000/wss/p2p/16Uiu2HAmMbo2nB3ZfTHNZi9tgLARsowksWPh7mBGQFXGSMLnF51o",
    NEW = "/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ"
}
export default class Waku {
    private node;
    private encoder;
    private decoder;
    private contentTopic;
    private remotePeerId;
    constructor(remotePeerId?: string);
    init(): Promise<this>;
    private dial;
    private subscribe;
    private receiveMessage;
    sendMessage(message: string): Promise<void>;
    onMessageRecevied(wakuMessage: any): Promise<void>;
}
