import "./multiaddr.min.js";
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
