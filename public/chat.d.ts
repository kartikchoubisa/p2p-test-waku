import { ChatClientTypes } from "@walletconnect/chat-client";
import WalletConnect from "./walletConnect.js";
export interface IMessageChunk {
    chunkNumber: number;
    totalChunks: number;
    data: string;
}
export type IMessage = ChatClientTypes.Message;
export default class Chat {
    static readonly MESSAGE_CHAR_LIMIT = 2000;
    selfAccount: WalletConnect;
    peerAddress: string;
    chatTopic: string;
    isConnected: boolean;
    messages: IMessage[];
    useJson: boolean;
    private messageUpdateCallback;
    private NO_UI_MODE;
    private raw_messages_received;
    private chatBusy;
    constructor(self: WalletConnect, peerAddress: string, options?: {
        useJson?: boolean;
    });
    invite(): Promise<void>;
    waitForConnection(): Promise<boolean>;
    freeChat(): Promise<unknown>;
    sendMessage(message: string): Promise<void>;
    private sendMessageJson;
    private getMessageChunks;
    private onChatInvite;
    private onChatInviteAccepted;
    private onChatMessage;
    setChatTopic(topic: string): void;
    private getMessages;
    private updateMessages;
    setMessageUpdateCallback(func: () => void): void;
}
