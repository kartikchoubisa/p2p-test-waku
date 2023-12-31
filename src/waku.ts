import  {multiaddr as multiformatsMultiaddr} from "@multiformats/multiaddr"

import {
    createLightNode,
    waitForRemotePeer,
    createEncoder,
    createDecoder,
    utf8ToBytes,
    bytesToUtf8,
    WakuNode,
    LightNode,
} from "@waku/sdk";

import { Protocols } from "@waku/sdk";

import { IMessage } from "./chat.js";

// TODO: i changed to module to create a global variable, which is not ideal
console.log("Multiaddr: ", globalThis.MultiformatsMultiaddr);

export enum remotePeerDomains {
    HK = "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm",
    SL_SG = "/dns4/nwaku.silent.sg/tcp/8000/wss/p2p/16Uiu2HAmMbo2nB3ZfTHNZi9tgLARsowksWPh7mBGQFXGSMLnF51o",
    NEW = "/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ"
}

export default class Waku {
    private node: LightNode;
    private encoder;
    private decoder;
    private contentTopic = "/js-waku-examples/1/chat/utf8";
    private remotePeerId;


    constructor(remotePeerId? : string) {
        if (!remotePeerId) {
            this.remotePeerId = remotePeerDomains.NEW; // set a default peer id here
            return
        }

        if (!(remotePeerId in remotePeerDomains)) {
            console.log("[waku] custom peer id given: ", remotePeerId);
            this.remotePeerId = remotePeerId;
            return
        }

        this.remotePeerId = remotePeerDomains[remotePeerId];
    }

    async init() {
        this.decoder = createDecoder(this.contentTopic);
        console.log("content topic", this.contentTopic);
        this.encoder = createEncoder({
            contentTopic: this.contentTopic,
            ephemeral: null,
            metaSetter: null,
        });
        
        this.node = await createLightNode();
        console.log("peerid???", this.node.libp2p.getConnections())
        await this.node.start();
        await this.dial();
        await this.subscribe();
        return this;
    }

    private async dial() {
        const ma = this.remotePeerId;
        if (!ma) {
            console.log("no multiaddr");
            return;
        }
        console.log("dialing: ", ma);
        const multiaddr = multiformatsMultiaddr(ma);
        await this.node.dial(multiaddr, [Protocols.Filter, Protocols.LightPush]);
        await waitForRemotePeer(this.node, [Protocols.Filter, Protocols.LightPush], 30000);
        const peers = await this.node.libp2p.peerStore.all();
        console.log("[waku] peer dialed, peers: ", peers);
    }

    private async subscribe() {
        console.log("[waku] subscribing... content topic", this.contentTopic);

        let callback = this.onMessageRecevied;
        await this.node.filter.subscribe(
            [this.decoder],
            callback
        );
        console.log("[waku] subscribed]");
    };

    private async receiveMessage() {
        
        return new Promise((resolve, reject) => {
            (async () => {

                await this.node.filter.subscribe(
                    [this.decoder],
                    (receivedMessage) => resolve(receivedMessage)
                );

            })();

            })

    }

    async sendMessage(message: string) {
        console.log("[waku] message waiting to send, time (before await): ", Date.now());
        await this.node.lightPush.send(this.encoder, {
            payload: utf8ToBytes(message),
        });
        console.log("[waku] message sent", message, "time (sent): ", Date.now());
    }

    async onMessageRecevied(wakuMessage) {
        console.log(wakuMessage);
        const text = bytesToUtf8(wakuMessage.payload);
        const timestamp = wakuMessage.timestamp
        // TODO remove this hack (hardcoding the author account )
        let messageObj: IMessage = JSON.parse(text);
        let messageFromSelf: boolean;
        if (typeof window !== 'undefined') {
            // browser code
            messageFromSelf = messageObj.authorAccount == window.location.port
        } else {
            // node code
            messageFromSelf = messageObj.authorAccount == "P2"
        }
        if (messageFromSelf) return;
        console.log("[waku] RAW message recevied callback", text, " time: ", Date.now());
        console.log("[waku] time taken to receive = ", Date.now() - messageObj.timestamp)
        globalThis.tempReceivedMessage = messageObj;
    }
}
