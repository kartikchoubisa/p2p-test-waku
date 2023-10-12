import { P1Keygen, P2Keygen, generateSessionId, P1Signer, P2Signer } from '@silencelaboratories/two-party-ecdsa-js';
import { randBytes as randomBytes } from '@com.silencelaboratories/ecdsa-tss';
import { receiveMessage, sendMessage, clearReceiveMessageIntervals } from './tss';
import Chat, { IMessage } from "./chat";


export async function performKeygen() {
    console.time("keygen")
    // Generate random session id
    const session_id = await generateSessionId();


    // Initialize keygen for each party
    const p1Keygen = await P1Keygen.init(session_id);
    const p2Keygen = await P2Keygen.init(session_id);

    // Round 1
    const msg = await p1Keygen.genMsg1();
    const msg2 = await p2Keygen.processMsg1(msg);

    // Round 2
    const [p1keyshare, msg3] = await p1Keygen.processMsg2(msg2);
    const p2keyshare = await p2Keygen.processMsg3(msg3);
    console.timeEnd("keygen")
    globalThis.p1keyshare = p1keyshare;
    globalThis.p2keyshare = p2keyshare;

    console.log(p1keyshare, p2keyshare)
}

export async function performKeygenP1(chat: Chat) {
    const session_id = [85, 9, 114, 150, 176, 19, 169, 211, 220, 243, 88, 143, 238, 126, 231, 39, 86, 38, 51, 68, 186, 202, 183, 70, 16, 195, 0, 195, 22, 19, 127, 212];

    const p1Keygen = await P1Keygen.init(session_id);

    // Round 1
    const msg1 = await p1Keygen.genMsg1();
    await sendMessage(JSON.stringify(msg1), chat);
    const msg2_received = await receiveMessage(2);
    const [p1keyshare, msg3] = await p1Keygen.processMsg2(JSON.parse(msg2_received));

    // Round 2
    await sendMessage(JSON.stringify(msg3), chat);
    globalThis.p1keyshare = p1keyshare;

}

export async function performKeygenP2(chat: Chat) {
    const session_id = [85, 9, 114, 150, 176, 19, 169, 211, 220, 243, 88, 143, 238, 126, 231, 39, 86, 38, 51, 68, 186, 202, 183, 70, 16, 195, 0, 195, 22, 19, 127, 212];

    const p2Keygen = await P2Keygen.init(session_id);

    // Round 1
    console.log("started listening!");
    const msg1_received = await receiveMessage(1);
    const msg2 = await p2Keygen.processMsg1(JSON.parse(msg1_received));
    await sendMessage(JSON.stringify(msg2), chat);

    // Round 2
    const msg3_received = await receiveMessage(3);
    const p2keyshare = await p2Keygen.processMsg3(JSON.parse(msg3_received));
    globalThis.p2keyshare = p2keyshare;

}



export async function performSignature() {

    const session_id = await generateSessionId();

    // Get message hash to sign (Using random bytes for example)
    const messageHash = await randomBytes(32);


    // Initialize signer for each party
    const p1Sign = await P1Signer.init(session_id, globalThis.p1keyshare, messageHash, "m");
    const p2Sign = await P2Signer.init(session_id, globalThis.p2keyshare, messageHash, "m");


    // Round 1
    const msg1 = await p1Sign.genMsg1();
    const signmsg2 = await p2Sign.processMsg1(msg1);

    // Round 2
    const signmsg3 = await p1Sign.processMsg2(signmsg2);
    const sign1 = signmsg3.sign_with_recid;
    const sign2 = await p2Sign.processMsg3(signmsg3);

    // Signatures must match
    // if (sign1 !== sign2) {
    //     throw new Error("Signatures do not match");
    // }
    console.log(sign1, sign2);
}

export async function performSignatureP1() {
    const session_id = [85, 9, 114, 150, 176, 19, 169, 211, 220, 243, 88, 143, 238, 126, 231, 39, 86, 38, 51, 68, 186, 202, 183, 70, 16, 195, 0, 195, 22, 19, 127, 212];
    const messageHash = Uint8Array.from([
        209, 208, 90, 82, 131, 171, 223, 205, 184, 236, 127, 63, 223, 171, 56, 179,
        184, 170, 54, 127, 4, 6, 152, 70, 97, 31, 187, 151, 16, 91, 91, 20,
    ]);
    const p1Sign = await P1Signer.init(session_id, globalThis.p1keyshare, messageHash, "m");

    // Round 1
    const msg1 = await p1Sign.genMsg1();
    await sendMessage(JSON.stringify(msg1), globalThis.chat);
    const msg2_received = await receiveMessage(2);

    // Round 2
    const msg3 = await p1Sign.processMsg2(JSON.parse(msg2_received));
    const sign1 = msg3.sign_with_recid;
    await sendMessage(JSON.stringify(msg3), globalThis.chat);
    console.log("sign1: ", sign1)
    return sign1;

}

export async function performSignatureP2() {
    const session_id = [85, 9, 114, 150, 176, 19, 169, 211, 220, 243, 88, 143, 238, 126, 231, 39, 86, 38, 51, 68, 186, 202, 183, 70, 16, 195, 0, 195, 22, 19, 127, 212];
    const messageHash = Uint8Array.from([
        209, 208, 90, 82, 131, 171, 223, 205, 184, 236, 127, 63, 223, 171, 56, 179,
        184, 170, 54, 127, 4, 6, 152, 70, 97, 31, 187, 151, 16, 91, 91, 20,
    ]);

    const p2Sign = await P2Signer.init(session_id, globalThis.p2keyshare, messageHash, "m");

    // Round 1
    console.log("started listening!");
    const msg1_received = await receiveMessage(1);
    const msg2 = await p2Sign.processMsg1(JSON.parse(msg1_received));
    await sendMessage(JSON.stringify(msg2), globalThis.chat);

    // Round 2
    const msg3_received = await receiveMessage(3);
    const sign2 = await p2Sign.processMsg3(JSON.parse(msg3_received));
    console.log("sign2: ", sign2)
    return sign2;


}


