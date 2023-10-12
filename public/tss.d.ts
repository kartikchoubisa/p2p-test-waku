import { IP1KeyShare, IP2KeyShare } from "@com.silencelaboratories/ecdsa-tss";
import Chat from "./chat";
export declare function performKeygenP1(chat: Chat): Promise<IP1KeyShare>;
export declare function performKeygenP2(chat: Chat): Promise<IP2KeyShare>;
export declare function clearReceiveMessageIntervals(): Promise<void>;
export declare function receiveMessage(phaseNum?: number): Promise<string>;
export declare function sendMessage(msg_to_send: string, chat: Chat): Promise<void>;
export declare function performKeygen(): Promise<[
    IP1KeyShare,
    IP2KeyShare
] | null>;
export declare function performSignature(): Promise<any>;
export declare function performSignatureP1(chat: Chat, p1KeyShare: IP1KeyShare): Promise<string>;
export declare function performSignatureP2(chat: Chat, p2KeyShare: IP2KeyShare): Promise<string>;
export declare function signature(): Promise<any>;
