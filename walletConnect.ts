import { Core } from "@walletconnect/core";
import {
  ChatClient,
  ChatClientTypes,
  IChatClient,
} from "@walletconnect/chat-client";
import { ISyncClient, SyncClient, SyncStore } from "@walletconnect/sync-client";

import Signer from "./wallet";

interface IConfig {
  projectId: string;
  relayUrl: string;
  keyserverUrl: string;
}

export default class WalletConnect{
  public chatClient: IChatClient;
  public address: string;
  //todo: one walletConnect app can have multiple signers (address), but for now we only support one
  private signer: Signer;
  private static config: IConfig;
  private sentMessages: Set<string> = new Set();

  public constructor(signer: Signer) {
    if (!WalletConnect.config) {
      throw new Error("WalletConnect not configured");
    }
    this.signer = signer;
    this.address = signer.address;
  }

  public static configure(
    projectId: string,
    relayUrl?: string,
    keyserverUrl?: string
  ) {
    WalletConnect.config = {
      projectId: projectId,
      relayUrl: relayUrl ?? "wss://relay.walletconnect.com",
      keyserverUrl: keyserverUrl ?? "https://keys.walletconnect.com",
    };
  }

  public async init() {
    try {
      // Initialize core separately to allow sharing it between sync and chat
      const core = new Core({
        projectId: WalletConnect.config.projectId,
      });

      // SyncClient enables syncing data across devices
      const syncClient: ISyncClient = await SyncClient.init({
        projectId: WalletConnect.config.projectId,
        core,
        relayUrl: WalletConnect.config.relayUrl,
      });

      this.chatClient = await ChatClient.init({
        core,
        projectId: WalletConnect.config.projectId,
        keyserverUrl: WalletConnect.config.keyserverUrl,
        relayUrl: WalletConnect.config.relayUrl,
        syncClient,
        SyncStoreController: SyncStore,
      });

      this.addEventListeners();
      await this.registerOnKeyserver();

      console.log("ChatClient initialized");
    } catch (e) {
      console.log(e);
    }
    return this;
  }

  public onChatInvite(
    chatInviteCallback: (
      event: ChatClientTypes.BaseEventArgs<{
        message: string;
        inviterAccount: string;
        inviteeAccount: string;
        inviteePublicKey: string;
      }>
    ) => void
  ) {
    this.chatClient.on("chat_invite", chatInviteCallback);
  }

  public onChatInviteAccepted(
    chatInviteAcceptedCallback: (
      event: {
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
      }
    ) => void
  ) {
    this.chatClient.on("chat_invite_accepted", chatInviteAcceptedCallback);
  }

  public onChatMessage(
    chatMessageCallback: (
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
    ) => void
  ) {
    this.chatClient.on("chat_message", chatMessageCallback);
  }

  // TODO: refractor. event handlers should be implemented by the tss library, but doing it here for now
  private addEventListeners() {

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

  private async registerOnKeyserver() {
    await this.chatClient.register({
      account: `eip155:1:${this.address}`,
      onSign: async (message) => {
        return await this.signer.signMessage(message);
      },
    });

    console.log(
      "[Chat] registered address %s on keyserver",
      `eip155:1:${this.address}`
    );
  }

  async invite(invitee: string, inviteMessage?: string) {
    console.assert(invitee != undefined)
    const inviteePublicKey = await this.chatClient.resolve({
      account: `eip155:1:${invitee}`,
    });

    await this.chatClient.invite({
      message: inviteMessage ?? "Hey, Let's chat!",
      inviterAccount: `eip155:1:${this.address}`, // your CAIP-2 formatted account that you registered previously.
      inviteeAccount: `eip155:1:${invitee}`, // the CAIP-2 formatted account of the recipient.
      inviteePublicKey,
    });
    console.log("INVITE SENT!");
  }

  public async getReceivedInvites() {
    const receivedInvites = this.chatClient.getReceivedInvites({
      account: `eip155:1:${this.address}`,
    });
    console.log("receivedInvites", receivedInvites);
    return receivedInvites;
  }

  public async acceptInvite(inviteId: number) {
    let chatTopic = await this.chatClient.accept({ id: inviteId });
    console.log("YOU ACCEPTED INVITE! chat thread/topic: ", chatTopic);
    return chatTopic;
  }

  public async sendMessageByTopic(message: string, topic: string) {
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
      console.log("[walletConnect] ERROR SENDING MESSAGE", e)
    }
  }

  public async sendMessageByPeer(message: string, peerAddress: string) {
    let chatTopic = this.getTopicFromPeer(peerAddress);
    await this.sendMessageByTopic(message, chatTopic);
  }

  private getTopicFromPeer(peerAddress: string) {
    let chatThreads = this.getChatTopics();
    let chatTopic = chatThreads.find(
      (thread) => thread.peerAccount == `eip155:1:${peerAddress}`
    ).topic;
    return chatTopic;
  }

  public getChatTopics() {
    let chatThreads = this.chatClient.chatThreads.getAll();
    console.log("CHAT THREADS: ", chatThreads);
    return chatThreads;
  }

  public getMessagesByTopic(topic: string) {
      let messages = this.chatClient.getMessages({topic});
      return messages;
  }
}
