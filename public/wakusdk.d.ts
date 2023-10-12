declare var Protocols: any;
declare var SendError: any;
declare var PageDirection$1: any;
declare var Tags: any;
declare var EPeersByDiscoveryEvents: any;
/**
 * Adds types to the EventTarget class. Hopefully this won't be necessary forever.
 *
 * https://github.com/microsoft/TypeScript/issues/28357
 * https://github.com/microsoft/TypeScript/issues/43477
 * https://github.com/microsoft/TypeScript/issues/299
 * etc
 */
declare let EventEmitter$3: {
    new (): {
        "__#46@#listeners": Map<any, any>;
        listenerCount(type: any): any;
        addEventListener(type: any, listener: any, options: any): void;
        removeEventListener(type: any, listener: any, options: any): void;
        dispatchEvent(event: any): boolean;
        safeDispatchEvent(type: any, detail: any): boolean;
    };
};
/**
 * Decode byte array to utf-8 string.
 */
declare const bytesToUtf8: (b: any) => any;
/**
 * Encode utf-8 string to byte array.
 */
declare const utf8ToBytes$4: (s: any) => any;
declare class DecodedMessage {
    pubSubTopic: any;
    proto: any;
    constructor(pubSubTopic: any, proto: any);
    get ephemeral(): boolean;
    get payload(): any;
    get contentTopic(): any;
    get _rawTimestamp(): any;
    get timestamp(): Date;
    get meta(): any;
    get version(): any;
    get rateLimitProof(): any;
}
declare let Encoder$e: {
    new (contentTopic: any, ephemeral: boolean, metaSetter: any): {
        contentTopic: any;
        ephemeral: any;
        metaSetter: any;
        toWire(message$1: any): Promise<any>;
        toProtoObj(message: any): Promise<{
            payload: any;
            version: number;
            contentTopic: any;
            timestamp: bigint;
            meta: any;
            rateLimitProof: any;
            ephemeral: any;
        }>;
    };
};
/**
 * Creates an encoder that encode messages without Waku level encryption or signature.
 *
 * An encoder is used to encode messages in the [`14/WAKU2-MESSAGE](https://rfc.vac.dev/spec/14/)
 * format to be sent over the Waku network. The resulting encoder can then be
 * pass to { @link @waku/interfaces.LightPush.push } or
 * { @link @waku/interfaces.Relay.send } to automatically encode outgoing
 * messages.
 */
declare function createEncoder({ contentTopic, ephemeral, metaSetter }: {
    contentTopic: any;
    ephemeral: any;
    metaSetter: any;
}): {
    contentTopic: any;
    ephemeral: any;
    metaSetter: any;
    toWire(message$1: any): Promise<any>;
    toProtoObj(message: any): Promise<{
        payload: any;
        version: number;
        contentTopic: any;
        timestamp: bigint;
        meta: any;
        rateLimitProof: any;
        ephemeral: any;
    }>;
};
declare let Decoder$e: {
    new (contentTopic: any): {
        contentTopic: any;
        fromWireToProtoObj(bytes: any): Promise<{
            payload: any;
            contentTopic: any;
            version: any;
            timestamp: any;
            meta: any;
            rateLimitProof: any;
            ephemeral: any;
        }>;
        fromProtoObj(pubSubTopic: any, proto: any): Promise<any>;
    };
};
/**
 * Creates a decoder that decode messages without Waku level encryption.
 *
 * A decoder is used to decode messages from the [14/WAKU2-MESSAGE](https://rfc.vac.dev/spec/14/)
 * format when received from the Waku network. The resulting decoder can then be
 * pass to { @link @waku/interfaces.Filter.subscribe } or
 * { @link @waku/interfaces.Relay.subscribe } to automatically decode incoming
 * messages.
 *
 * @param contentTopic The resulting decoder will only decode messages with this content topic.
 */
declare function createDecoder(contentTopic: any): {
    contentTopic: any;
    fromWireToProtoObj(bytes: any): Promise<{
        payload: any;
        contentTopic: any;
        version: any;
        timestamp: any;
        meta: any;
        rateLimitProof: any;
        ephemeral: any;
    }>;
    fromProtoObj(pubSubTopic: any, proto: any): Promise<any>;
};
declare class KeepAliveManager {
    pingKeepAliveTimers: any;
    relayKeepAliveTimers: any;
    options: any;
    relay: any;
    constructor(options: any, relay: any);
    start(peerId: any, libp2pPing: any, peerStore: any): void;
    stop(peerId: any): void;
    stopAll(): void;
}
declare class ConnectionManager extends EventEmitter$3 {
    static instances: Map<any, any>;
    keepAliveManager: any;
    options: any;
    libp2p: any;
    dialAttemptsForPeer: Map<any, any>;
    dialErrorsForPeer: Map<any, any>;
    currentActiveDialCount: number;
    pendingPeerDialQueue: any[];
    static create(peerId: any, libp2p: any, keepAliveOptions: any, relay: any, options: any): any;
    getPeersByDiscovery(): Promise<{
        DISCOVERED: {
            [x: number]: any[];
        };
        CONNECTED: {
            [x: number]: any[];
        };
    }>;
    constructor(libp2p: any, keepAliveOptions: any, relay: any, options: any);
    dialPeerStorePeers(): Promise<void>;
    run(): Promise<void>;
    stop(): void;
    dialPeer(peerId: any): Promise<void>;
    dropConnection(peerId: any): Promise<void>;
    processDialQueue(): void;
    startPeerDiscoveryListener(): void;
    startPeerConnectionListener(): void;
    startPeerDisconnectionListener(): void;
    attemptDial(peerId: any): Promise<void>;
    onEventHandlers: {
        "peer:discovery": (evt: any) => void;
        "peer:connect": (evt: any) => void;
        "peer:disconnect": () => (evt: any) => void;
    };
    /**
     * Checks if the peer is dialable based on the following conditions:
     * 1. If the peer is a bootstrap peer, it is only dialable if the number of current bootstrap connections is less than the max allowed.
     * 2. If the peer is not a bootstrap peer
     */
    shouldDialPeer(peerId: any): Promise<boolean>;
    /**
     * Fetches the tag names for a given peer
     */
    getTagNamesForPeer(peerId: any): Promise<unknown[]>;
}
declare class WakuNode {
    libp2p: any;
    relay: any;
    store: any;
    filter: any;
    lightPush: any;
    connectionManager: any;
    constructor(options: any, libp2p: any, store: any, lightPush: any, filter: any, relay: any);
    /**
     * Dials to the provided peer.
     *
     * @param peer The peer to dial
     * @param protocols Waku protocols we expect from the peer; Defaults to mounted protocols
     */
    dial(peer: any, protocols: any): Promise<any>;
    start(): Promise<void>;
    stop(): Promise<void>;
    isStarted(): any;
    /**
     * Return the local multiaddr with peer id on which libp2p is listening.
     *
     * @throws if libp2p is not listening on localhost.
     */
    getLocalMultiaddrWithID(): string;
}
declare function isDefined(value: any): boolean;
/**
 * Return pseudo random subset of the input.
 */
declare function getPseudoRandomSubset(values: any, wantedNumber: any): any;
declare function groupByContentTopic(values: any): Map<any, any>;
/**
 * Function that transforms IReceiver subscription to iterable stream of data.
 * @param receiver - object that allows to be subscribed to;
 * @param decoder - parameter to be passed to receiver for subscription;
 * @param options - options for receiver for subscription;
 * @param iteratorOptions - optional configuration for iterator;
 * @returns iterator and stop function to terminate it.
 */
declare function toAsyncIterator(receiver: any, decoder: any, iteratorOptions: any): Promise<{
    iterator: AsyncGenerator<any, any, unknown>;
    stop(): Promise<void>;
}>;
declare function removeItemFromArray(arr: any, value: any): any;
declare var index$5: Readonly<{
    __proto__: any;
    getPseudoRandomSubset: typeof getPseudoRandomSubset;
    groupByContentTopic: typeof groupByContentTopic;
    isDefined: typeof isDefined;
    isSizeValid: (payload: any) => boolean;
    removeItemFromArray: typeof removeItemFromArray;
    toAsyncIterator: typeof toAsyncIterator;
}>;
declare class StreamManager {
    multicodec: any;
    getConnections: any;
    addEventListener: any;
    streamPool: any;
    log: any;
    constructor(multicodec: any, getConnections: any, addEventListener: any);
    getStream(peer: any): Promise<any>;
    newStream(peer: any): Promise<any>;
    prepareNewStream(peer: any): void;
    handlePeerUpdateStreamPool: (evt: any) => void;
}
/**
 * A class with predefined helpers, to be used as a base to implement Waku
 * Protocols.
 */
declare class BaseProtocol {
    multicodec: any;
    components: any;
    addLibp2pEventListener: any;
    removeLibp2pEventListener: any;
    streamManager: any;
    constructor(multicodec: any, components: any);
    getStream(peer: any): Promise<any>;
    get peerStore(): any;
    /**
     * Returns known peers from the address book (`libp2p.peerStore`) that support
     * the class protocol. Waku may or may not be currently connected to these
     * peers.
     */
    peers(): Promise<any[]>;
    getPeer(peerId: any): Promise<any>;
    /**
     * Retrieves a list of peers based on the specified criteria.
     *
     * @param numPeers - The total number of peers to retrieve. If 0, all peers are returned.
     * @param maxBootstrapPeers - The maximum number of bootstrap peers to retrieve.
     * @returns A Promise that resolves to an array of peers based on the specified criteria.
     */
    getPeers({ numPeers, maxBootstrapPeers }?: {
        maxBootstrapPeers: number;
        numPeers: number;
    }): Promise<any[]>;
}
declare class Filter extends BaseProtocol {
    options: any;
    activeSubscriptions: Map<any, any>;
    NUM_PEERS_PROTOCOL: number;
    getActiveSubscription(pubSubTopic: any, peerIdStr: any): any;
    setActiveSubscription(pubSubTopic: any, peerIdStr: any, subscription: any): any;
    constructor(libp2p: any, options: any);
    createSubscription(pubSubTopic: any): Promise<any>;
    toSubscriptionIterator(decoders: any): Promise<{
        iterator: AsyncGenerator<any, any, unknown>;
        stop(): Promise<void>;
    }>;
    /**
     * This method is used to satisfy the `IReceiver` interface.
     *
     * @hidden
     *
     * @param decoders The decoders to use for the subscription.
     * @param callback The callback function to use for the subscription.
     * @param opts Optional protocol options for the subscription.
     *
     * @returns A Promise that resolves to a function that unsubscribes from the subscription.
     *
     * @remarks
     * This method should not be used directly.
     * Instead, use `createSubscription` to create a new subscription.
     */
    subscribe(decoders: any, callback: any): Promise<() => Promise<void>>;
    onRequest(streamData: any): void;
}
declare function wakuFilter(init?: {}): (libp2p: any) => Filter;
declare class PushRpc {
    proto: any;
    constructor(proto: any);
    static createRequest(message: any, pubSubTopic: any): PushRpc;
    static decode(bytes: any): PushRpc;
    encode(): any;
    get query(): any;
    get response(): any;
}
/**
 * Implements the [Waku v2 Light Push protocol](https://rfc.vac.dev/spec/19/).
 */
declare class LightPush extends BaseProtocol {
    options: any;
    NUM_PEERS_PROTOCOL: number;
    constructor(libp2p: any, options: any);
    preparePushMessage(encoder: any, message: any, pubSubTopic: any): Promise<{
        query: any;
        error: any;
    } | {
        query: PushRpc;
        error: any;
    }>;
    send(encoder: any, message: any): Promise<{
        recipients: any[];
        errors: any[];
    }>;
}
declare function wakuLightPush(init?: {}): (libp2p: any) => LightPush;
/**
 * Implements the [Waku v2 Store protocol](https://rfc.vac.dev/spec/13/).
 *
 * The Waku Store protocol can be used to retrieved historical messages.
 */
declare class Store extends BaseProtocol {
    options: any;
    NUM_PEERS_PROTOCOL: number;
    constructor(libp2p: any, options: any);
    /**
     * Processes messages based on the provided callback and options.
     * @private
     */
    processMessages(messages: any, callback: any, options: any): Promise<boolean>;
    /**
     * Determines whether to reverse the order of messages based on the provided options.
     *
     * Messages in pages are ordered from oldest (first) to most recent (last).
     * https://github.com/vacp2p/rfc/issues/533
     *
     * @private
     */
    shouldReverseOrder(options: any): boolean;
    /**
     * @deprecated Use `queryWithOrderedCallback` instead
     **/
    queryOrderedCallback: (decoders: any, callback: any, options: any) => Promise<void>;
    /**
     * Do a query to a Waku Store to retrieve historical/missed messages.
     *
     * The callback function takes a `WakuMessage` in input,
     * messages are processed in order:
     * - oldest to latest if `options.pageDirection` == { @link PageDirection.FORWARD }
     * - latest to oldest if `options.pageDirection` == { @link PageDirection.BACKWARD }
     *
     * The ordering may affect performance.
     * The ordering depends on the behavior of the remote store node.
     * If strong ordering is needed, you may need to handle this at application level
     * and set your own timestamps too (the WakuMessage timestamps are not certified).
     *
     * @throws If not able to reach a Waku Store peer to query,
     * or if an error is encountered when processing the reply,
     * or if two decoders with the same content topic are passed.
     */
    queryWithOrderedCallback(decoders: any, callback: any, options: any): Promise<void>;
    /**
     * Do a query to a Waku Store to retrieve historical/missed messages.
     * The callback function takes a `Promise<WakuMessage>` in input,
     * useful if messages need to be decrypted and performance matters.
     *
     * The order of the messages passed to the callback is as follows:
     * - within a page, messages are expected to be ordered from oldest to most recent
     * - pages direction depends on { @link QueryOptions.pageDirection }
     *
     * Do note that the resolution of the `Promise<WakuMessage | undefined` may
     * break the order as it may rely on the browser decryption API, which in turn,
     * may have a different speed depending on the type of decryption.
     *
     * @throws If not able to reach a Waku Store peer to query,
     * or if an error is encountered when processing the reply,
     * or if two decoders with the same content topic are passed.
     */
    queryWithPromiseCallback(decoders: any, callback: any, options: any): Promise<void>;
    /**
     * Do a query to a Waku Store to retrieve historical/missed messages.
     *
     * This is a generator, useful if you want most control on how messages
     * are processed.
     *
     * The order of the messages returned by the remote Waku node SHOULD BE
     * as follows:
     * - within a page, messages SHOULD be ordered from oldest to most recent
     * - pages direction depends on { @link QueryOptions.pageDirection }
     * @throws If not able to reach a Waku Store peer to query,
     * or if an error is encountered when processing the reply,
     * or if two decoders with the same content topic are passed.
     */
    queryGenerator(decoders: any, options: any): AsyncGenerator<any, void, unknown>;
}
declare function createCursor(message: any, pubsubTopic?: string): Promise<{
    digest: any;
    pubsubTopic: string;
    senderTime: bigint;
    receiverTime: bigint;
}>;
declare function wakuStore(init?: {}): (libp2p: any) => Store;
/**
 * Wait for a remote peer to be ready given the passed protocols.
 * Must be used after attempting to connect to nodes, using
 * {@link @waku/core.WakuNode.dial} or a bootstrap method with
 * {@link @waku/sdk.createLightNode}.
 *
 * If the passed protocols is a GossipSub protocol, then it resolves only once
 * a peer is in a mesh, to help ensure that other peers will send and receive
 * message to us.
 *
 * @param waku The Waku Node
 * @param protocols The protocols that need to be enabled by remote peers.
 * @param timeoutMs A timeout value in milliseconds..
 *
 * @returns A promise that **resolves** if all desired protocols are fulfilled by
 * remote nodes, **rejects** if the timeoutMs is reached.
 * @throws If passing a protocol that is not mounted
 * @default Wait for remote peers with protocols enabled locally and no time out is applied.
 */
declare function waitForRemotePeer(waku: any, protocols: any, timeoutMs: any): Promise<never>;
declare var index$1: Readonly<{
    __proto__: any;
    ConnectionManager: typeof ConnectionManager;
    DefaultPubSubTopic: "/waku/2/default-waku/proto";
    DefaultUserAgent: "js-waku";
    FilterCodecs: {
        SUBSCRIBE: string;
        PUSH: string;
    };
    KeepAliveManager: typeof KeepAliveManager;
    readonly PageDirection: any;
    StreamManager: typeof StreamManager;
    WakuNode: typeof WakuNode;
    createCursor: typeof createCursor;
    createDecoder: typeof createDecoder;
    createEncoder: typeof createEncoder;
    message: Readonly<{
        __proto__: any;
        version_0: Readonly<{
            __proto__: any;
            DecodedMessage: typeof DecodedMessage;
            Decoder: {
                new (contentTopic: any): {
                    contentTopic: any;
                    fromWireToProtoObj(bytes: any): Promise<{
                        payload: any;
                        contentTopic: any;
                        version: any;
                        timestamp: any;
                        meta: any;
                        rateLimitProof: any;
                        ephemeral: any;
                    }>;
                    fromProtoObj(pubSubTopic: any, proto: any): Promise<any>;
                };
            };
            Encoder: {
                new (contentTopic: any, ephemeral: boolean, metaSetter: any): {
                    contentTopic: any;
                    ephemeral: any;
                    metaSetter: any;
                    toWire(message$1: any): Promise<any>;
                    toProtoObj(message: any): Promise<{
                        payload: any;
                        version: number;
                        contentTopic: any;
                        timestamp: bigint;
                        meta: any;
                        rateLimitProof: any;
                        ephemeral: any;
                    }>;
                };
            };
            Version: 0;
            createDecoder: typeof createDecoder;
            createEncoder: typeof createEncoder;
            proto: Readonly<{
                __proto__: any;
                readonly RateLimitProof: any;
                readonly WakuMessage: any;
            }>;
        }>;
    }>;
    waitForRemotePeer: typeof waitForRemotePeer;
    waku: Readonly<{
        __proto__: any;
        DefaultPingKeepAliveValueSecs: 0;
        DefaultRelayKeepAliveValueSecs: number;
        DefaultUserAgent: "js-waku";
        WakuNode: typeof WakuNode;
    }>;
    wakuFilter: typeof wakuFilter;
    wakuLightPush: typeof wakuLightPush;
    wakuStore: typeof wakuStore;
    waku_filter: Readonly<{
        __proto__: any;
        FilterCodecs: {
            SUBSCRIBE: string;
            PUSH: string;
        };
        wakuFilter: typeof wakuFilter;
    }>;
    waku_light_push: Readonly<{
        __proto__: any;
        LightPushCodec: "/vac/waku/lightpush/2.0.0-beta1";
        readonly PushResponse: any;
        wakuLightPush: typeof wakuLightPush;
    }>;
    waku_store: Readonly<{
        __proto__: any;
        DefaultPageSize: 10;
        readonly PageDirection: any;
        StoreCodec: "/vac/waku/store/2.0.0-beta4";
        createCursor: typeof createCursor;
        wakuStore: typeof wakuStore;
    }>;
}>;
/**
 * Adds types to the EventTarget class. Hopefully this won't be necessary forever.
 *
 * https://github.com/microsoft/TypeScript/issues/28357
 * https://github.com/microsoft/TypeScript/issues/43477
 * https://github.com/microsoft/TypeScript/issues/299
 * etc
 */
declare let EventEmitter$2: {
    new (): {
        "__#47@#listeners": Map<any, any>;
        listenerCount(type: any): any;
        addEventListener(type: any, listener: any, options: any): void;
        removeEventListener(type: any, listener: any, options: any): void;
        dispatchEvent(event: any): boolean;
        safeDispatchEvent(type: any, detail: any): boolean;
    };
};
/**
 * Any object that implements this Symbol as a property should return a
 * PeerDiscovery instance as the property value, similar to how
 * `Symbol.Iterable` can be used to return an `Iterable` from an `Iterator`.
 *
 * @example
 *
 * ```js
 * import { peerDiscovery, PeerDiscovery } from '@libp2p/peer-discovery'
 *
 * class MyPeerDiscoverer implements PeerDiscovery {
 *   get [peerDiscovery] () {
 *     return this
 *   }
 *
 *   // ...other methods
 * }
 * ```
 */
declare const peerDiscovery: unique symbol;
/**
 * Parse options and expose function to return bootstrap peer addresses.
 */
declare class PeerDiscoveryDns extends EventEmitter$2 {
    nextPeer: any;
    _started: any;
    _components: any;
    _options: any;
    constructor(components: any, options: any);
    /**
     * Start discovery process
     */
    start(): Promise<void>;
    /**
     * Stop emitting events
     */
    stop(): void;
    get [peerDiscovery](): boolean;
    get [Symbol.toStringTag](): string;
}
declare class PeerExchangeDiscovery extends EventEmitter$2 {
    components: any;
    peerExchange: any;
    options: any;
    isStarted: any;
    queryingPeers: Set<unknown>;
    queryAttempts: Map<any, any>;
    handleDiscoveredPeer: (event: any) => void;
    constructor(components: any, options?: {});
    /**
     * Start emitting events
     */
    start(): void;
    /**
     * Remove event listener
     */
    stop(): void;
    get [peerDiscovery](): boolean;
    get [Symbol.toStringTag](): string;
    startRecurringQueries: (peerId: any) => Promise<void>;
    query(peerId: any): Promise<void>;
    abortQueriesForPeer(peerIdStr: any): void;
}
declare class GossipSub extends EventEmitter$2 {
    /**
     * The signature policy to follow by default
     */
    globalSignaturePolicy: any;
    multicodecs: string[];
    publishConfig: any;
    dataTransform: any;
    peers: Set<unknown>;
    streamsInbound: Map<any, any>;
    streamsOutbound: Map<any, any>;
    /** Ensures outbound streams are created sequentially */
    outboundInflightQueue: any;
    /** Direct peers */
    direct: Set<unknown>;
    /** Floodsub peers */
    floodsubPeers: Set<unknown>;
    /** Cache of seen messages */
    seenCache: any;
    /**
     * Map of peer id and AcceptRequestWhileListEntry
     */
    acceptFromWhitelist: Map<any, any>;
    /**
     * Map of topics to which peers are subscribed to
     */
    topics: Map<any, any>;
    /**
     * List of our subscriptions
     */
    subscriptions: Set<unknown>;
    /**
     * Map of topic meshes
     * topic => peer id set
     */
    mesh: Map<any, any>;
    /**
     * Map of topics to set of peers. These mesh peers are the ones to which we are publishing without a topic membership
     * topic => peer id set
     */
    fanout: Map<any, any>;
    /**
     * Map of last publish time for fanout topics
     * topic => last publish time
     */
    fanoutLastpub: Map<any, any>;
    /**
     * Map of pending messages to gossip
     * peer id => control messages
     */
    gossip: Map<any, any>;
    /**
     * Map of control messages
     * peer id => control message
     */
    control: Map<any, any>;
    /**
     * Number of IHAVEs received from peer in the last heartbeat
     */
    peerhave: Map<any, any>;
    /** Number of messages we have asked from peer in the last heartbeat */
    iasked: Map<any, any>;
    /** Prune backoff map */
    backoff: Map<any, any>;
    /**
     * Connection direction cache, marks peers with outbound connections
     * peer id => direction
     */
    outbound: Map<any, any>;
    msgIdFn: any;
    /**
     * A fast message id function used for internal message de-duplication
     */
    fastMsgIdFn: any;
    msgIdToStrFn: any;
    /** Maps fast message-id to canonical message-id */
    fastMsgIdCache: any;
    /**
     * Short term cache for published message ids. This is used for penalizing peers sending
     * our own messages back if the messages are anonymous or use a random author.
     */
    publishedMessageIds: any;
    /**
     * A message cache that contains the messages for last few heartbeat ticks
     */
    mcache: any;
    /** Peer score tracking */
    score: any;
    /**
     * Custom validator function per topic.
     * Must return or resolve quickly (< 100ms) to prevent causing penalties for late messages.
     * If you need to apply validation that may require longer times use `asyncValidation` option and callback the
     * validation result through `Gossipsub.reportValidationResult`
     */
    topicValidators: Map<any, any>;
    /**
     * Make this protected so child class may want to redirect to its own log.
     */
    log: any;
    /**
     * Number of heartbeats since the beginning of time
     * This allows us to amortize some resource cleanup -- eg: backoff cleanup
     */
    heartbeatTicks: number;
    /**
     * Tracks IHAVE/IWANT promises broken by peers
     */
    gossipTracer: any;
    components: any;
    directPeerInitial: any;
    static multicodec: string;
    opts: any;
    decodeRpcLimits: any;
    metrics: any;
    status: {
        code: any;
    };
    maxInboundStreams: any;
    maxOutboundStreams: any;
    allowedTopics: any;
    heartbeatTimer: any;
    constructor(components: any, options?: {});
    getPeers(): any[];
    isStarted(): boolean;
    /**
     * Mounts the gossipsub protocol onto the libp2p node and sends our
     * our subscriptions to every peer connected
     */
    start(): Promise<void>;
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     */
    stop(): Promise<void>;
    /** FOR DEBUG ONLY - Dump peer stats for all peers. Data is cloned, safe to mutate */
    dumpPeerScoreStats(): any;
    /**
     * On an inbound stream opened
     */
    onIncomingStream({ stream, connection }: {
        stream: any;
        connection: any;
    }): void;
    /**
     * Registrar notifies an established connection with pubsub protocol
     */
    onPeerConnected(peerId: any, connection: any): void;
    /**
     * Registrar notifies a closing connection with pubsub protocol
     */
    onPeerDisconnected(peerId: any): void;
    createOutboundStream(peerId: any, connection: any): Promise<void>;
    createInboundStream(peerId: any, stream: any): Promise<void>;
    /**
     * Add a peer to the router
     */
    addPeer(peerId: any, direction: any, addr: any): void;
    /**
     * Removes a peer from the router
     */
    removePeer(peerId: any): void;
    get started(): boolean;
    /**
     * Get a the peer-ids in a topic mesh
     */
    getMeshPeers(topic: any): unknown[];
    /**
     * Get a list of the peer-ids that are subscribed to one topic.
     */
    getSubscribers(topic: any): any[];
    /**
     * Get the list of topics which the peer is subscribed to.
     */
    getTopics(): unknown[];
    /**
     * Responsible for processing each RPC message received by other peers.
     */
    pipePeerReadStream(peerId: any, stream: any): Promise<void>;
    /**
     * Handle error when read stream pipe throws, less of the functional use but more
     * to for testing purposes to spy on the error handling
     * */
    handlePeerReadStreamError(err: any, peerId: any): void;
    /**
     * Handles an rpc request from a peer
     */
    handleReceivedRpc(from: any, rpc: any): Promise<void>;
    /**
     * Handles a subscription change from a peer
     */
    handleReceivedSubscription(from: any, topic: any, subscribe: any): void;
    /**
     * Handles a newly received message from an RPC.
     * May forward to all peers in the mesh.
     */
    handleReceivedMessage(from: any, rpcMsg: any): Promise<void>;
    /**
     * Handles a newly received message from an RPC.
     * May forward to all peers in the mesh.
     */
    validateReceivedMessage(propagationSource: any, rpcMsg: any): Promise<{
        code: any;
        msgIdStr: any;
        reason?: undefined;
        error?: undefined;
        messageId?: undefined;
        msg?: undefined;
    } | {
        code: any;
        reason: any;
        error: any;
        msgIdStr?: undefined;
        messageId?: undefined;
        msg?: undefined;
    } | {
        code: any;
        reason: any;
        msgIdStr: any;
        error?: undefined;
        messageId?: undefined;
        msg?: undefined;
    } | {
        code: any;
        messageId: {
            msgId: any;
            msgIdStr: any;
        };
        msg: {
            type: string;
            topic: any;
            data: any;
            from?: undefined;
            sequenceNumber?: undefined;
            signature?: undefined;
            key?: undefined;
        } | {
            type: string;
            from: any;
            data: any;
            sequenceNumber: bigint;
            topic: any;
            signature: any;
            key: any;
        };
        msgIdStr?: undefined;
        reason?: undefined;
        error?: undefined;
    }>;
    /**
     * Return score of a peer.
     */
    getScore(peerId: any): any;
    /**
     * Send an rpc object to a peer with subscriptions
     */
    sendSubscriptions(toPeer: any, topics: any, subscribe: any): void;
    /**
     * Handles an rpc control message from a peer
     */
    handleControlMessage(id: any, controlMsg: any): Promise<void>;
    /**
     * Whether to accept a message from a peer
     */
    acceptFrom(id: any): boolean;
    /**
     * Handles IHAVE messages
     */
    handleIHave(id: any, ihave: any): {
        messageIDs: any[];
    }[];
    /**
     * Handles IWANT messages
     * Returns messages to send back to peer
     */
    handleIWant(id: any, iwant: any): any[];
    /**
     * Handles Graft messages
     */
    handleGraft(id: any, graft: any): Promise<({
        topicID: any;
        peers: any[];
        backoff?: undefined;
    } | {
        topicID: any;
        peers: {
            peerID: any;
            signedPeerRecord: any;
        }[];
        backoff: number;
    })[]>;
    /**
     * Handles Prune messages
     */
    handlePrune(id: any, prune: any): Promise<void>;
    /**
     * Add standard backoff log for a peer in a topic
     */
    addBackoff(id: any, topic: any): void;
    /**
     * Add backoff expiry interval for a peer in a topic
     *
     * @param id
     * @param topic
     * @param intervalMs - backoff duration in milliseconds
     */
    doAddBackoff(id: any, topic: any, intervalMs: any): void;
    /**
     * Apply penalties from broken IHAVE/IWANT promises
     */
    applyIwantPenalties(): void;
    /**
     * Clear expired backoff expiries
     */
    clearBackoff(): void;
    /**
     * Maybe reconnect to direct peers
     */
    directConnect(): Promise<void>;
    /**
     * Maybe attempt connection given signed peer records
     */
    pxConnect(peers: any): Promise<void>;
    /**
     * Connect to a peer using the gossipsub protocol
     */
    connect(id: any): Promise<void>;
    /**
     * Subscribes to a topic
     */
    subscribe(topic: any): void;
    /**
     * Unsubscribe to a topic
     */
    unsubscribe(topic: any): void;
    /**
     * Join topic
     */
    join(topic: any): void;
    /**
     * Leave topic
     */
    leave(topic: any): void;
    selectPeersToForward(topic: any, propagationSource: any, excludePeers: any): Set<unknown>;
    selectPeersToPublish(topic: any): {
        tosend: Set<unknown>;
        tosendCount: {
            direct: number;
            floodsub: number;
            mesh: number;
            fanout: number;
        };
    };
    /**
     * Forwards a message from our peers.
     *
     * For messages published by us (the app layer), this class uses `publish`
     */
    forwardMessage(msgIdStr: any, rawMsg: any, propagationSource: any, excludePeers: any): void;
    /**
     * App layer publishes a message to peers, return number of peers this message is published to
     * Note: `async` due to crypto only if `StrictSign`, otherwise it's a sync fn.
     *
     * For messages not from us, this class uses `forwardMessage`.
     */
    publish(topic: any, data: any, opts: any): Promise<{
        recipients: any[];
    }>;
    /**
     * This function should be called when `asyncValidation` is `true` after
     * the message got validated by the caller. Messages are stored in the `mcache` and
     * validation is expected to be fast enough that the messages should still exist in the cache.
     * There are three possible validation outcomes and the outcome is given in acceptance.
     *
     * If acceptance = `MessageAcceptance.Accept` the message will get propagated to the
     * network. The `propagation_source` parameter indicates who the message was received by and
     * will not be forwarded back to that peer.
     *
     * If acceptance = `MessageAcceptance.Reject` the message will be deleted from the memcache
     * and the P₄ penalty will be applied to the `propagationSource`.
     *
     * If acceptance = `MessageAcceptance.Ignore` the message will be deleted from the memcache
     * but no P₄ penalty will be applied.
     *
     * This function will return true if the message was found in the cache and false if was not
     * in the cache anymore.
     *
     * This should only be called once per message.
     */
    reportMessageValidationResult(msgId: any, propagationSource: any, acceptance: any): void;
    /**
     * Sends a GRAFT message to a peer
     */
    sendGraft(id: any, topic: any): void;
    /**
     * Sends a PRUNE message to a peer
     */
    sendPrune(id: any, topic: any): Promise<void>;
    /**
     * Send an rpc object to a peer
     */
    sendRpc(id: any, rpc: any): boolean;
    /** Mutates `outRpc` adding graft and prune control messages */
    piggybackControl(id: any, outRpc: any, ctrl: any): void;
    /** Mutates `outRpc` adding ihave control messages */
    piggybackGossip(id: any, outRpc: any, ihave: any): void;
    /**
     * Send graft and prune messages
     *
     * @param tograft - peer id => topic[]
     * @param toprune - peer id => topic[]
     */
    sendGraftPrune(tograft: any, toprune: any, noPX: any): Promise<void>;
    /**
     * Emits gossip - Send IHAVE messages to a random set of gossip peers
     */
    emitGossip(peersToGossipByTopic: any): void;
    /**
     * Send gossip messages to GossipFactor peers above threshold with a minimum of D_lazy
     * Peers are randomly selected from the heartbeat which exclude mesh + fanout peers
     * We also exclude direct peers, as there is no reason to emit gossip to them
     * @param topic
     * @param candidateToGossip - peers to gossip
     * @param messageIDs - message ids to gossip
     */
    doEmitGossip(topic: any, candidateToGossip: any, messageIDs: any): void;
    /**
     * Flush gossip and control messages
     */
    flush(): void;
    /**
     * Adds new IHAVE messages to pending gossip
     */
    pushGossip(id: any, controlIHaveMsgs: any): void;
    /**
     * Make a PRUNE control message for a peer in a topic
     */
    makePrune(id: any, topic: any, doPX: any, onUnsubscribe: any): Promise<{
        topicID: any;
        peers: any[];
        backoff?: undefined;
    } | {
        topicID: any;
        peers: {
            peerID: any;
            signedPeerRecord: any;
        }[];
        backoff: number;
    }>;
    runHeartbeat: () => void;
    /**
     * Maintains the mesh and fanout maps in gossipsub.
     */
    heartbeat(): Promise<void>;
    /**
     * Given a topic, returns up to count peers subscribed to that topic
     * that pass an optional filter function
     *
     * @param topic
     * @param count
     * @param filter - a function to filter acceptable peers
     */
    getRandomGossipPeers(topic: any, count: any, filter?: () => boolean): Set<any>;
    onScrapeMetrics(metrics: any): void;
}
/**
 * Implements the [Waku v2 Relay protocol](https://rfc.vac.dev/spec/11/).
 * Throws if libp2p.pubsub does not support Waku Relay
 */
declare class Relay {
    pubSubTopic: any;
    defaultDecoder: any;
    static multicodec: string;
    gossipSub: any;
    /**
     * observers called when receiving new message.
     * Observers under key `""` are always called.
     */
    observers: any;
    constructor(libp2p: any, options: any);
    /**
     * Mounts the gossipsub protocol onto the libp2p node
     * and subscribes to the default topic.
     *
     * @override
     * @returns {void}
     */
    start(): Promise<void>;
    /**
     * Send Waku message.
     */
    send(encoder: any, message: any): Promise<any>;
    /**
     * Add an observer and associated Decoder to process incoming messages on a given content topic.
     *
     * @returns Function to delete the observer
     */
    subscribe(decoders: any, callback: any): () => void;
    toSubscriptionIterator(decoders: any): Promise<{
        iterator: AsyncGenerator<any, any, unknown>;
        stop(): Promise<void>;
    }>;
    getActiveSubscriptions(): Map<any, any>;
    getMeshPeers(topic: any): any;
    processIncomingMessage(pubSubTopic: any, bytes: any): Promise<void>;
    /**
     * Subscribe to a pubsub topic and start emitting Waku messages to observers.
     *
     * @override
     */
    gossipSubSubscribe(pubSubTopic: any): void;
    isRelayPubSub(pubsub: any): any;
}
declare function wakuRelay(init?: {}): (libp2p: any) => Relay;
declare function wakuGossipSub(init?: {}): (components: any) => GossipSub;
declare var index: Readonly<{
    __proto__: any;
    wakuGossipSub: typeof wakuGossipSub;
    wakuRelay: typeof wakuRelay;
}>;
declare class Libp2pNode extends EventEmitter$2 {
    #private;
    peerId: any;
    peerStore: any;
    contentRouting: any;
    peerRouting: any;
    keychain: any;
    metrics: any;
    services: any;
    components: any;
    constructor(init: any);
    configureComponent(name: any, component: any): any;
    /**
     * Starts the libp2p node and all its subsystems
     */
    start(): Promise<void>;
    /**
     * Stop the libp2p node by closing its listeners and open connections
     */
    stop(): Promise<void>;
    isStarted(): any;
    getConnections(peerId: any): any;
    getDialQueue(): any;
    getPeers(): any[];
    dial(peer: any, options?: {}): Promise<any>;
    dialProtocol(peer: any, protocols: any, options?: {}): Promise<any>;
    getMultiaddrs(): any;
    getProtocols(): any;
    hangUp(peer: any, options?: {}): Promise<void>;
    /**
     * Get the public key for the given peer id
     */
    getPublicKey(peer: any, options?: {}): Promise<any>;
    handle(protocols: any, handler: any, options: any): Promise<void>;
    unhandle(protocols: any): Promise<void>;
    register(protocol: any, topology: any): Promise<any>;
    unregister(id: any): void;
}
/**
 * Create a Waku node that uses Waku Light Push, Filter and Store to send and
 * receive messages, enabling low resource consumption.
 * Uses Waku Filter V2 by default.
 */
declare function createLightNode(options: any): Promise<WakuNode>;
/**
 * Create a Waku node that uses Waku Relay to send and receive messages,
 * enabling some privacy preserving properties.
 */
declare function createRelayNode(options: any): Promise<WakuNode>;
/**
 * Create a Waku node that uses all Waku protocols.
 *
 * This helper is not recommended except if:
 * - you are interfacing with nwaku v0.11 or below
 * - you are doing some form of testing
 *
 * If you are building a full node, it is recommended to use
 * [nwaku](github.com/status-im/nwaku) and its JSON RPC API or wip REST API.
 *
 * @see https://github.com/status-im/nwaku/issues/1085
 * @internal
 */
declare function createFullNode(options: any): Promise<WakuNode>;
declare function defaultPeerDiscoveries(): (((components: any) => PeerDiscoveryDns) | ((components: any) => PeerExchangeDiscovery))[];
declare function defaultLibp2p(wakuGossipSub: any, options: any, userAgent: any): Promise<Libp2pNode>;
export { DecodedMessage, Decoder$e as Decoder, EPeersByDiscoveryEvents, Encoder$e as Encoder, PageDirection$1 as PageDirection, Protocols, SendError, Tags, WakuNode, bytesToUtf8, createDecoder, createEncoder, createFullNode, createLightNode, createRelayNode, defaultLibp2p, defaultPeerDiscoveries, index as relay, utf8ToBytes$4 as utf8ToBytes, index$5 as utils, waitForRemotePeer, index$1 as waku };
