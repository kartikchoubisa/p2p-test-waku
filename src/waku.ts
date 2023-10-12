import "./multiaddr.min.js";
import { IMessage } from "./chat.js";
import {
    createLightNode,
    waitForRemotePeer,
    createEncoder,
    createDecoder,
    utf8ToBytes,
    bytesToUtf8,
    WakuNode,
} from "./wakusdk.js";

// TODO: i changed to module to create a global variable, which is not ideal
console.log("Multiaddr: ", globalThis.MultiformatsMultiaddr);

export default class Waku {
    private node: WakuNode;
    private encoder;
    private decoder;
    private contentTopic = "/js-waku-examples/1/chat/utf8";
    private remotePeerId;
        


    constructor(remotePeerId? : string) {
        // this.remotePeerId = remotePeerId || "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm"; 
        this.remotePeerId = remotePeerId || "/dns4/nwaku.silent.sg/tcp/8000/wss/p2p/16Uiu2HAmMbo2nB3ZfTHNZi9tgLARsowksWPh7mBGQFXGSMLnF51o"; 
    } 
//C 
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
        const multiaddr = globalThis.MultiformatsMultiaddr.multiaddr(ma);
        await this.node.dial(multiaddr, ["filter", "lightpush"]);
        await waitForRemotePeer(this.node, ["filter", "lightpush"], 30000);
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
        // TODO remove this hack
        let messageObj: IMessage = JSON.parse(text);
        let messageFromSelf = messageObj.authorAccount == window.location.port
        if (messageFromSelf) return;
        console.log("[waku] RAW message recevied callback", text, " time: ", Date.now());
        console.log("[waku] time taken to receive = ", Date.now() - messageObj.timestamp)
        globalThis.tempReceivedMessage = messageObj;
    }
}
