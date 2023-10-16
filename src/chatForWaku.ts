import Waku from "./waku.js";
import { IMessage } from "./chat.js";

export default class ChatForWaku {
    private selfAccount: Waku;
    private name: string; // to make different users identifiable
    

    constructor(self: Waku, name: string) {
        this.selfAccount = self;
        this.name = name;
    }

    async sendMessage(message: string) {
        let messageObj: IMessage = {
            authorAccount: this.name,
            message: message,
            timestamp: Date.now(),
            topic: "tempTSS"
        }
        let messageString = JSON.stringify(messageObj);
        this.selfAccount.sendMessage(messageString);
    }


}