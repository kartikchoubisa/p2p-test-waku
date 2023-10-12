"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@walletconnect/core");
const chat_client_1 = require("@walletconnect/chat-client");
const sync_client_1 = require("@walletconnect/sync-client");
class WalletConnect {
    constructor(signer) {
        this.sentMessages = new Set();
        if (!WalletConnect.config) {
            throw new Error("WalletConnect not configured");
        }
        this.signer = signer;
        this.address = signer.address;
    }
    static configure(projectId, relayUrl, keyserverUrl) {
        WalletConnect.config = {
            projectId: projectId,
            relayUrl: relayUrl ?? "wss://relay.walletconnect.com",
            keyserverUrl: keyserverUrl ?? "https://keys.walletconnect.com",
        };
    }
    async init() {
        try {
            // Initialize core separately to allow sharing it between sync and chat
            const core = new core_1.Core({
                projectId: WalletConnect.config.projectId,
            });
            // SyncClient enables syncing data across devices
            const syncClient = await sync_client_1.SyncClient.init({
                projectId: WalletConnect.config.projectId,
                core,
                relayUrl: WalletConnect.config.relayUrl,
            });
            this.chatClient = await chat_client_1.ChatClient.init({
                core,
                projectId: WalletConnect.config.projectId,
                keyserverUrl: WalletConnect.config.keyserverUrl,
                relayUrl: WalletConnect.config.relayUrl,
                syncClient,
                SyncStoreController: sync_client_1.SyncStore,
            });
            this.addEventListeners();
            await this.registerOnKeyserver();
            console.log("ChatClient initialized");
        }
        catch (e) {
            console.log(e);
        }
        return this;
    }
    onChatInvite(chatInviteCallback) {
        this.chatClient.on("chat_invite", chatInviteCallback);
    }
    onChatInviteAccepted(chatInviteAcceptedCallback) {
        this.chatClient.on("chat_invite_accepted", chatInviteAcceptedCallback);
    }
    onChatMessage(chatMessageCallback) {
        this.chatClient.on("chat_message", chatMessageCallback);
    }
    // TODO: refractor. event handlers should be implemented by the tss library, but doing it here for now
    addEventListeners() {
        // this.chatClient.on("chat_invite", async (event) => {
        //   // React to an incoming invite to chat.
        //   console.log("RECEIVED INVITE!", event);
        //     // handle received invite (only for our useCase)
        //     let receivedInvites = this.getReceivedInvites();
        //     console.log(receivedInvites);
        // });
        // this.chatClient.on("chat_invite_accepted", async (event) => {
        //   // React to your peer joining a given chat.
        //   console.log("INVITE ACCEPTED BY THE PEER! : ", event);
        //   console.log("chat topic? : ", event.topic);
        //   this.getChatTopics();
        // });
        this.chatClient.on("chat_invite_rejected", async (event) => {
            // React to your peer declining your invite
            console.log("INVITE REJECTED BY THE PEER!", event);
        });
        // this.chatClient.on("chat_message", (event) => {
        //   // React to an incoming messages for a given chat.
        //   console.log("RECEIVED MESSAGE!", event);
        // });
        this.chatClient.on("chat_ping", (event) => {
            // React to an incoming ping event from a peer on a given chat topic.
            console.log("RECEIVED PING!", event);
        });
        this.chatClient.on("chat_left", (event) => {
            // React to a peer leaving a given chat.
        });
    }
    async registerOnKeyserver() {
        await this.chatClient.register({
            account: `eip155:1:${this.address}`,
            onSign: async (message) => {
                return await this.signer.signMessage(message);
            },
        });
        console.log("[Chat] registered address %s on keyserver", `eip155:1:${this.address}`);
    }
    async invite(invitee, inviteMessage) {
        console.assert(invitee != undefined);
        const inviteePublicKey = await this.chatClient.resolve({
            account: `eip155:1:${invitee}`,
        });
        await this.chatClient.invite({
            message: inviteMessage ?? "Hey, Let's chat!",
            inviterAccount: `eip155:1:${this.address}`,
            inviteeAccount: `eip155:1:${invitee}`,
            inviteePublicKey,
        });
        console.log("INVITE SENT!");
    }
    async getReceivedInvites() {
        const receivedInvites = this.chatClient.getReceivedInvites({
            account: `eip155:1:${this.address}`,
        });
        console.log("receivedInvites", receivedInvites);
        return receivedInvites;
    }
    async acceptInvite(inviteId) {
        let chatTopic = await this.chatClient.accept({ id: inviteId });
        console.log("YOU ACCEPTED INVITE! chat thread/topic: ", chatTopic);
        return chatTopic;
    }
    async sendMessageByTopic(message, topic) {
        //TODO: temp. why sending multiple messages?
        // check if message exists in this.messagesSent
        // if (this.messagesSent.includes(message)) {
        //   console.log("message already sent");
        // console.assert(!this.sentMessages.has(message), "message already sent!?")
        // this.sentMessages.add(message);
        console.log("[walletConnect] SENDING MESSAGE------ \n\n ", message);
        try {
            await this.chatClient.message({
                topic,
                message,
                authorAccount: `eip155:1:${this.address}`,
                timestamp: Date.now(),
            });
        }
        catch (e) {
            console.log("[walletConnect] ERROR SENDING MESSAGE", e);
        }
    }
    async sendMessageByPeer(message, peerAddress) {
        let chatTopic = this.getTopicFromPeer(peerAddress);
        await this.sendMessageByTopic(message, chatTopic);
    }
    getTopicFromPeer(peerAddress) {
        let chatThreads = this.getChatTopics();
        let chatTopic = chatThreads.find((thread) => thread.peerAccount == `eip155:1:${peerAddress}`).topic;
        return chatTopic;
    }
    getChatTopics() {
        let chatThreads = this.chatClient.chatThreads.getAll();
        console.log("CHAT THREADS: ", chatThreads);
        return chatThreads;
    }
    getMessagesByTopic(topic) {
        let messages = this.chatClient.getMessages({ topic });
        return messages;
    }
}
exports.default = WalletConnect;
