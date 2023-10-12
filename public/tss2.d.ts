import Chat from "./chat";
export declare function performKeygen(): Promise<void>;
export declare function performKeygenP1(chat: Chat): Promise<void>;
export declare function performKeygenP2(chat: Chat): Promise<void>;
export declare function performSignature(): Promise<void>;
export declare function performSignatureP1(): Promise<import("@silencelaboratories/two-party-ecdsa-js").SignWithRecId>;
export declare function performSignatureP2(): Promise<import("@silencelaboratories/two-party-ecdsa-js").SignWithRecId>;
