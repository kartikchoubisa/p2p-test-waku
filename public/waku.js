"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./multiaddr.min.js");
const sdk_1 = require("@waku/sdk");
// TODO: i changed to module to create a global variable, which is not ideal
console.log("Multiaddr: ", globalThis.MultiformatsMultiaddr);
class Waku {
    constructor(remotePeerId) {
        this.contentTopic = "/js-waku-examples/1/chat/utf8";
        // this.remotePeerId = remotePeerId || "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm"; 
        this.remotePeerId = remotePeerId || "/dns4/nwaku.silent.sg/tcp/8000/wss/p2p/16Uiu2HAmMbo2nB3ZfTHNZi9tgLARsowksWPh7mBGQFXGSMLnF51o";
    }
    //C 
    async init() {
        this.decoder = (0, sdk_1.createDecoder)(this.contentTopic);
        console.log("content topic", this.contentTopic);
        this.encoder = (0, sdk_1.createEncoder)({
            contentTopic: this.contentTopic,
            ephemeral: null,
            metaSetter: null,
        });
        // @ts-ignore
        this.node = await (0, sdk_1.createLightNode)();
        console.log("peerid???", this.node.libp2p.getConnections());
        await this.node.start();
        await this.dial();
        await this.subscribe();
        return this;
    }
    async dial() {
        const ma = this.remotePeerId;
        if (!ma) {
            console.log("no multiaddr");
            return;
        }
        console.log("dialing: ", ma);
        const multiaddr = globalThis.MultiformatsMultiaddr.multiaddr(ma);
        //@ts-ignore
        await this.node.dial(multiaddr, ["filter", "lightpush"]);
        // @ts-ignore
        await (0, sdk_1.waitForRemotePeer)(this.node, ["filter", "lightpush"], 30000);
        const peers = await this.node.libp2p.peerStore.all();
        console.log("[waku] peer dialed, peers: ", peers);
    }
    async subscribe() {
        console.log("[waku] subscribing... content topic", this.contentTopic);
        let callback = this.onMessageRecevied;
        await this.node.filter.subscribe([this.decoder], callback);
        console.log("[waku] subscribed]");
    }
    ;
    async receiveMessage() {
        return new Promise((resolve, reject) => {
            (async () => {
                await this.node.filter.subscribe([this.decoder], (receivedMessage) => resolve(receivedMessage));
            })();
        });
    }
    async sendMessage(message) {
        console.log("[waku] message waiting to send, time (before await): ", Date.now());
        await this.node.lightPush.send(this.encoder, {
            payload: (0, sdk_1.utf8ToBytes)(message),
        });
        console.log("[waku] message sent", message, "time (sent): ", Date.now());
    }
    async onMessageRecevied(wakuMessage) {
        console.log(wakuMessage);
        const text = (0, sdk_1.bytesToUtf8)(wakuMessage.payload);
        const timestamp = wakuMessage.timestamp;
        // TODO remove this hack
        let messageObj = JSON.parse(text);
        let messageFromSelf = messageObj.authorAccount == window.location.port;
        if (messageFromSelf)
            return;
        console.log("[waku] RAW message recevied callback", text, " time: ", Date.now());
        console.log("[waku] time taken to receive = ", Date.now() - messageObj.timestamp);
        globalThis.tempReceivedMessage = messageObj;
    }
}
exports.default = Waku;
