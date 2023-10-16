import { ChatClient, ChatClientTypes } from "@walletconnect/chat-client";
import WalletConnect from "./walletConnect.js";

export interface IMessageChunk {
    chunkNumber: number;
    totalChunks: number;
    data: string;
}

export type IMessage = ChatClientTypes.Message;

export default class Chat {
    // handle one chat between two accounts
    // this design allows ONLY ONE chat in the app
    // todo: persist chat topic?
    public static readonly MESSAGE_CHAR_LIMIT = 2000;
    public selfAccount: WalletConnect;
    public peerAddress: string;
    public chatTopic: string;
    public isConnected: boolean = false;
    public messages: IMessage[] = [];
    public useJson = false;
    private messageUpdateCallback: (lastMessage: IMessage) => void;
    private NO_UI_MODE: boolean; // TODO: if true, don't waste time on anything other than sending/processing msgs
    private raw_messages_received = new Set<ChatClientTypes.Message>();
    private chatBusy = false; // to prevent multiple chat actions at once

    constructor(
        self: WalletConnect,
        peerAddress: string,
        options?: { useJson?: boolean }
    ) {
        this.selfAccount = self;
        this.peerAddress = peerAddress;
        // set up event handlers
        this.selfAccount.onChatInvite(this.onChatInvite); // when selfAccount is invitee
        this.selfAccount.onChatInviteAccepted(this.onChatInviteAccepted); // when selfAccount is inviter
        this.selfAccount.onChatMessage(this.onChatMessage); // rcv msg

        if (options.useJson) {
            this.useJson = true;
        }

        // recover chat?
        let topics = this.selfAccount.getChatTopics();
        console.log("PREVIOUS TOPICS? ", topics);
        console.assert(topics.length <= 1, "More than one chat topics found");
        if (topics.length == 1) {
            this.isConnected = true;
            this.chatTopic = topics[0].topic;
            // this.updateMessages();
        }
    }

    async invite() {
        if (this.isConnected) {
            throw new Error("Chat already connected");
        }
        if (!this.peerAddress) {
            throw new Error("Peer address not set");
        }
        await this.selfAccount.invite(this.peerAddress);

        await this.waitForConnection();
    }

    async waitForConnection(): Promise<boolean> {
        //TODO: better way to wait without polling
        // keep checking if this.isConnected is true, upto 10 seconds
        // return true if connected, else throw error
        return new Promise((resolve, reject) => {
            let checkConnectionInterval = setInterval(() => {
                if (this.isConnected) {
                    clearInterval(checkConnectionInterval);
                    console.log(this);
                    resolve(true);
                }
            }, 10);

            setTimeout(() => {
                clearInterval(checkConnectionInterval);
                reject(new Error("Connection timed out"));
            }, 10000);
        });
    }

    async freeChat() {
        // return new Promise(res => setTimeout(res, 2000));
        if (!this.chatBusy) {
            return;
        }
        console.log("[chat] --------\n\n CHAT BUSY, waiting for freeing");
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (!this.chatBusy) {
                    clearInterval(interval);
                    console.log("[chat] --------\n\n CHAT FREE");
                    resolve(true);
                }
            }, 10);

            setTimeout(() => {
                clearInterval(interval);
                reject(new Error("Chat Busy Timeout"));
            }, 10000);
        });
    }

    async sendMessage(message: string) {
        console.log("[chat] ------ send Message");
        await this.freeChat();
        this.chatBusy = true;
        try {
            if (this.useJson) {
                await this.sendMessageJson(message);
            } else {
                if (message.length > Chat.MESSAGE_CHAR_LIMIT) {
                    throw new Error("Message too long, use JSON mode");
                }
                await this.selfAccount.sendMessageByTopic(message, this.chatTopic);
            }
            // console.log("-------------promise setup")
            // await new Promise( res => setTimeout(res, 5000)) // TODO: updateMessge calls getMessages before the message is sent
            // console.log("-----------------promise done?!")
            this.updateMessages();
        } catch (e) {
            throw e;
        } finally {
            this.chatBusy = false;
        }
    }

    private async sendMessageJson(message: string) {
        let chunks = this.getMessageChunks(message);
        console.log("SENDING MESSAGE CHUNKS", chunks);
        for (let chunk of chunks) {
            await this.selfAccount.sendMessageByTopic(
                JSON.stringify(chunk),
                this.chatTopic
            );
            // TODO: cooldown
            // await new Promise(res => setTimeout(res, 1000))
        }
    }

    private getMessageChunks(message: string) {
        let messageChunk: IMessageChunk;

        let chunkSize = Chat.MESSAGE_CHAR_LIMIT - 100;

        let totalChunks = Math.ceil(message.length / chunkSize);
        const chunks = [];

        for (let i = 0; i < totalChunks; i++) {
            let data = message.slice(i * chunkSize, (i + 1) * chunkSize);
            messageChunk = {
                chunkNumber: i,
                totalChunks: totalChunks,
                data: data,
            };

            //jsonify
            let messageChunkJSON = JSON.stringify(messageChunk);
            console.assert(
                messageChunkJSON.length <= Chat.MESSAGE_CHAR_LIMIT,
                "Message chunk too long!?"
            );
            chunks.push(messageChunk);
        }
        return chunks;
    }

    private async onChatInvite(
        event: ChatClientTypes.BaseEventArgs<{
            message: string;
            inviterAccount: string;
            inviteeAccount: string;
            inviteePublicKey: string;
        }>
    ) {
        console.log("CHAT INVITE RECEIVED", event);
        // TODO: MUST remove dependency on where the chat obj is instantiated
        // this is a hack to get the chat obj, as the event handler is not a method of the chat obj
        let _this: Chat = globalThis.chat;
        console.log("THIS", _this);
        if (_this.isConnected) {
            throw new Error("Chat already connected");
        }
        // accept invite get get the topic
        // invit ID not sent with the event, weird, so get the latest invite?!
        let invites = await _this.selfAccount.getReceivedInvites();
        // find the invite from peerAddress
        let invite = invites.find(
            (invite) => invite.inviterAccount === `eip155:1:${_this.peerAddress}`
        );
        console.log("TESTING invite:", invite);
        // accept the invite, set the chat topic
        // chat topic is easy for the invitee, as it's returned by the acceptInvite method
        _this.setChatTopic(await _this.selfAccount.acceptInvite(invite.id));
        // todo: we have accepted the invite, but there's no confirmation that peer has received _this info
        // so it's not correct to set isConnected to true here
        // rather, wait for acknowledgement from peer
        _this.isConnected = true;
    }

    private onChatInviteAccepted(event: {
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
    }) {
        console.log("CHAT INVITE ACCEPTED", event);
        let _this = globalThis.chat;
        console.log("THIS", _this);

        // set the chat topic
        // selfAccount is the inviter

        let chatTopics = _this.selfAccount.getChatTopics();
        // todo: how to get the chat topic1?
        // there should be only one chat Topic for this peer
        // otherwise no way of identifying which topic is the one accepted by the peer
        console.assert(
            chatTopics.filter(
                (topic) => topic.peerAccount === `eip155:1:${_this.peerAddress}`
            ).length === 1
        );
        _this.setChatTopic(
            chatTopics.find(
                (topic) => topic.peerAccount === `eip155:1:${_this.peerAddress}`
            ).topic
        );
        _this.isConnected = true;
    }

    private onChatMessage(
        event: ChatClientTypes.BaseEventArgs<{
            media?: {
                type: string;
                data: string;
            };
            message: string;
            topic: string;
            authorAccount: string;
            timestamp: number;
        }>
    ) {
        // TODO: a lot of stuff going on here, need to clean up
        (async () => {
            console.log(
                "[chat] ---\n\nCHAT MESSAGE RECEIVED",
                event.params,
                "receivedAt: ",
                Date.now()
            );
            let _this: Chat = globalThis.chat;
            await _this.freeChat();
            _this.chatBusy = true;
            try {
                if (_this.raw_messages_received.has(event.params)) {
                    console.log("[chat] MESSAGE ALREADY RECEIVED, SKIPPING");
                    return;
                }
                _this.raw_messages_received.add(event.params);

                let isLastChunk = (messageChunkJSON: string) => {
                    let messageChunk: IMessageChunk = JSON.parse(messageChunkJSON);
                    return messageChunk.chunkNumber === messageChunk.totalChunks - 1;
                };

                if (_this.useJson && !isLastChunk(event.params.message)) {
                    return;
                }

                console.log("IS LAST CHUNK, updating messages -------------");
                _this.updateMessages();
            } catch (e) {
                throw e;
            } finally {
                _this.chatBusy = false;
            }
        })();
    }

    public setChatTopic(topic: string) {
        this.chatTopic = topic;
        localStorage.setItem("chatTopic", topic);
    }

    private getMessages() {
        let raw_messages: IMessage[] = this.selfAccount.getMessagesByTopic(
            this.chatTopic
        );

        // make sure no duplicates, by checking same timestamp
        let hasDuplicates = (array: IMessage[]) => {
            return (
                new Set(array.map((message) => message.timestamp)).size !== array.length
            );
        };

        if (hasDuplicates(raw_messages)) {
            throw new Error("Duplicate messages found in chat");
        }

        if (!this.useJson) {
            return raw_messages;
        } else {
            // concatanate all message chunks, based on chunkNumber
            let messages: IMessage[] = [];

            let message = ""; // concatanated message
            for (let raw_message of raw_messages) {
                let messageChunkJSON = raw_message.message;
                let messageChunk: IMessageChunk = JSON.parse(messageChunkJSON);

                message += messageChunk.data;

                if (messageChunk.chunkNumber === messageChunk.totalChunks - 1) {
                    // last chunk
                    // push a message of type IMessage

                    let messageFormatted: IMessage = {
                        message: message, //concatanated message!
                        topic: raw_message.topic,
                        authorAccount: raw_message.authorAccount,
                        timestamp: raw_message.timestamp, // of the last chunk
                    };
                    messages.push(messageFormatted);
                    message = ""; // reset message
                }
            }

            // sort array?!
            // TODO: idk if required
            messages.sort((a, b) => {
                let timea = a.timestamp;
                let timeb = b.timestamp;
                return timea - timeb;
            });

            return messages;
        }
    }
    private updateMessages() {
        // must be called only when complete message is received in case of JSON message

        this.messages = this.getMessages();
        console.log(
            "[chat] --------\n\nupdate messages, last message: ",
            this.messages[this.messages.length - 1]
        );
        // check if sorted
        let isSorted = () =>
            this.messages.every(
                (m: IMessage, index: number) =>
                    index === 0 || m.timestamp >= this.messages[index - 1].timestamp
            );
        //TODO: why is messages not sorted!?
        console.assert(
            isSorted(),
            "--------\n\n\n--------\n\n\n----messages not sorted by time!?"
        );

        console.log("yo message updated!");
        console.log(
            "***** [chat] messageUpdateCallback: ", this.messageUpdateCallback
        );
        if (this.messageUpdateCallback) {
            console.assert(this.messages.length > 0, "No messages found");
            this.messageUpdateCallback(this.messages[this.messages.length - 1]);
        }
        // TODO: REMOVE GLOBAL VAR. temp fix for async polling in tss.js
        let lastMsg = this.messages[this.messages.length - 1];
        let isReceived = lastMsg.authorAccount.includes(this.peerAddress);
        if (!isReceived){
            return;
        }
        globalThis.tempReceivedMessage = lastMsg;
    }

    public setMessageUpdateCallback(func: () => void) {
        console.log("[chat] message update callback set");
        this.messageUpdateCallback = func;
    }
}
