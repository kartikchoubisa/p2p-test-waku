import { ChatClientTypes, IChatClient } from "@walletconnect/chat-client";
import Signer from "./wallet.js";
export default class WalletConnect {
    chatClient: IChatClient;
    address: string;
    private signer;
    private static config;
    private sentMessages;
    constructor(signer: Signer);
    static configure(projectId: string, relayUrl?: string, keyserverUrl?: string): void;
    init(): Promise<this>;
    onChatInvite(chatInviteCallback: (event: ChatClientTypes.BaseEventArgs<{
        message: string;
        inviterAccount: string;
        inviteeAccount: string;
        inviteePublicKey: string;
    }>) => void): void;
    onChatInviteAccepted(chatInviteAcceptedCallback: (event: {
        invite: {
            message: string;
            inviterAccount: string;
            inviteeAccount: string;
            status: "pending" | "rejected" | "approved";
            timestamp: number;
            id: number;
            responseTopic: string;
            inviterPubKeyY: string;
            inviterPrivKeyY: string;
            symKey: string;
        };
    }) => void): void;
    onChatMessage(chatMessageCallback: (event: ChatClientTypes.BaseEventArgs<{
        media?: {
            type: string;
            data: string;
        };
        message: string;
        topic: string;
        authorAccount: string;
        timestamp: number;
    }>) => void): void;
    private addEventListeners;
    private registerOnKeyserver;
    invite(invitee: string, inviteMessage?: string): Promise<void>;
    getReceivedInvites(): Promise<{
        message: string;
        inviterAccount: string;
        inviteeAccount: string;
        inviteePublicKey: string;
        status: "pending" | "rejected" | "approved";
        timestamp: number;
        id: number;
        inviterPublicKey: string;
    }[]>;
    acceptInvite(inviteId: number): Promise<string>;
    sendMessageByTopic(message: string, topic: string): Promise<void>;
    sendMessageByPeer(message: string, peerAddress: string): Promise<void>;
    private getTopicFromPeer;
    getChatTopics(): {
        topic: string;
        symKey: string;
        selfAccount: string;
        peerAccount: string;
    }[];
    getMessagesByTopic(topic: string): {
        message: string;
        topic: string;
        authorAccount: string;
        timestamp: number;
        media?: {
            type: string;
            data: string;
        };
    }[];
}
