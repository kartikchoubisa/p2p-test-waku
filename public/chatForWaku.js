"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatForWaku {
    constructor(self, name) {
        this.selfAccount = self;
        this.name = name;
    }
    async sendMessage(message) {
        let messageObj = {
            authorAccount: this.name,
            message: message,
            timestamp: Date.now(),
            topic: "tempTSS"
        };
        let messageString = JSON.stringify(messageObj);
        this.selfAccount.sendMessage(messageString);
    }
}
exports.default = ChatForWaku;
