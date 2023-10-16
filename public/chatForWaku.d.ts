import Waku from "./waku.js";
export default class ChatForWaku {
    private selfAccount;
    private name;
    constructor(self: Waku, name: string);
    sendMessage(message: string): Promise<void>;
}
