"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signature = exports.performSignatureP2 = exports.performSignatureP1 = exports.performSignature = exports.performKeygen = exports.sendMessage = exports.receiveMessage = exports.clearReceiveMessageIntervals = exports.performKeygenP2 = exports.performKeygenP1 = void 0;
const ecdsa_tss_1 = require("@com.silencelaboratories/ecdsa-tss");
console.log("[tss] LOADED-----------");
let messageDict = {};
globalThis.receiveMessageIntervals = [];
async function delay(ms) {
    // return
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// each round for p2 is exactly same,
// wait to receive message, process it, send message
// for p1: process msg, send msg, wait to receive
// async function P2Round() {
//     let msg_rec = await receiveMessage();
//     console.log("msg_rec", msg_rec)
//     let msg_next = await p2.processMessage(msg_rec);
//     console.log("msg_next", msg_next)
//     await sendMessage(msg_next.msg_to_send,chat);
// }
async function performKeygenP1(chat) {
    const sessionId = "some session id";
    const x1 = await (0, ecdsa_tss_1.randBytes)(32);
    const p1 = new ecdsa_tss_1.P1KeyGen(sessionId, x1);
    await p1.init();
    // Round 1
    const msg1 = await p1.processMessage(null);
    console.log("msg1.msg_to_send", msg1.msg_to_send.length);
    console.log("sending message: ", msg1.msg_to_send);
    await sendMessage(msg1.msg_to_send, chat);
    let msg2_received = await receiveMessage(2);
    console.log("hiiiiiiiii--- miessagelksjfreceived msg2");
    // Round 2
    const msg3 = await p1.processMessage(msg2_received);
    const p1KeyShare = msg3.p1_key_share;
    console.log("msg3.msg_to_send", msg3.msg_to_send.length);
    console.log("sending message: ", msg3.msg_to_send);
    await sendMessage(msg3.msg_to_send, chat);
    console.log("p1KeyShare", p1KeyShare);
    return p1KeyShare;
}
exports.performKeygenP1 = performKeygenP1;
async function performKeygenP2(chat) {
    const sessionId = "some session id";
    const x2 = await (0, ecdsa_tss_1.randBytes)(32);
    const p2 = new ecdsa_tss_1.P2KeyGen(sessionId, x2);
    // Round 1
    console.log("started listening!");
    let msg1_received = await receiveMessage(1);
    const msg2 = await p2.processMessage(msg1_received);
    console.log("msg2.msg_to_send", msg2.msg_to_send.length);
    await sendMessage(msg2.msg_to_send, chat);
    // Round 2
    let msg3_received = await receiveMessage(3);
    let msg4 = await p2.processMessage(msg3_received);
    const p2KeyShare = msg4.p2_key_share;
    console.log("p2KeyShare", p2KeyShare);
    return p2KeyShare;
}
exports.performKeygenP2 = performKeygenP2;
function putMessageToDict(message) {
    let phase = message.phase;
    // get last digit in phase string
    let phaseNum = parseInt(phase.at(-1));
    // put message in dict
    console.assert(!messageDict[phaseNum], "messageDict[phaseNum] should be null");
    messageDict[phaseNum] = JSON.stringify(message);
}
function getMessageFromDict(phaseNum) {
    let message = messageDict[phaseNum];
    messageDict[phaseNum] = null;
    return message;
}
async function clearReceiveMessageIntervals() {
    globalThis.receiveMessageIntervals.forEach((interval) => {
        clearInterval(interval);
    });
}
exports.clearReceiveMessageIntervals = clearReceiveMessageIntervals;
async function receiveMessage(phaseNum) {
    return await new Promise((resolve, reject) => {
        globalThis.receiveMessageIntervals.push(setInterval(() => {
            if (!globalThis.tempReceivedMessage)
                return;
            let messageObj = globalThis.tempReceivedMessage;
            let message = messageObj.message; // the final concataned message
            console.log("[tss] message received", JSON.parse(message));
            globalThis.tempReceivedMessage = null;
            // putMessageToDict(JSON.parse(message))
            // let resolvedMessage = getMessageFromDict(phaseNum)
            let resolvedMessage = message;
            resolve(resolvedMessage);
            clearReceiveMessageIntervals();
        }, 10));
        setTimeout(() => {
            clearReceiveMessageIntervals();
            reject("[tss] timeout-- no message received");
        }, 30000);
    });
}
exports.receiveMessage = receiveMessage;
async function sendMessage(msg_to_send, chat) {
    console.log("[tss] sending message: ", JSON.parse(msg_to_send), "timestamp", Date.now());
    await chat.sendMessage(msg_to_send);
    // await delay(5000)
}
exports.sendMessage = sendMessage;
async function performKeygen() {
    const sessionId = "some session id";
    const x1 = await (0, ecdsa_tss_1.randBytes)(32);
    const x2 = await (0, ecdsa_tss_1.randBytes)(32);
    const p1 = new ecdsa_tss_1.P1KeyGen(sessionId, x1);
    await p1.init();
    const p2 = new ecdsa_tss_1.P2KeyGen(sessionId, x2);
    // Round 1
    const msg1 = await p1.processMessage(null);
    console.log("msg1.msg_to_send", msg1.msg_to_send.length);
    const msg2 = await p2.processMessage(msg1.msg_to_send);
    // Round 2
    console.log("msg2.msg_to_send", msg2.msg_to_send.length);
    const msg3 = await p1.processMessage(msg2.msg_to_send);
    const p1KeyShare = msg3.p1_key_share;
    console.log("msg3.msg_to_send", msg3.msg_to_send.length);
    let msg4 = await p2.processMessage(msg3.msg_to_send);
    const p2KeyShare = msg4.p2_key_share;
    if (!p1KeyShare || !p2KeyShare) {
        return null;
    }
    globalThis.p1keyshare = p1KeyShare;
    globalThis.p2keyshare = p2KeyShare;
    console.log("p1KeyShare", p1KeyShare);
    console.log("p2KeyShare", p2KeyShare);
    return [p1KeyShare, p2KeyShare];
}
exports.performKeygen = performKeygen;
async function performSignature() {
    const sessionId = "session id for signature";
    const messageHash = await (0, ecdsa_tss_1.randBytes)(32);
    const p1 = new ecdsa_tss_1.P1Signature(sessionId, messageHash, globalThis.p1keyshare);
    const p2 = new ecdsa_tss_1.P2Signature(sessionId, messageHash, globalThis.p2keyshare);
    // Round 1
    const msg1 = await p1.processMessage(null);
    const msg2 = await p2.processMessage(msg1.msg_to_send);
    // Round 2
    const msg3 = await p1.processMessage(msg2.msg_to_send);
    const msg4 = await p2.processMessage(msg3.msg_to_send);
    // Round 3
    const msg5 = await p1.processMessage(msg4.msg_to_send);
    const p1Sign = msg5.signature;
    const msg6 = await p2.processMessage(msg5.msg_to_send);
    const p2Sign = msg6.signature;
    if (!p1Sign || !p2Sign) {
        return null;
    }
    console.log("p1Sign", "0x" + p1Sign);
    console.log("p2Sign", "0x" + p2Sign);
}
exports.performSignature = performSignature;
async function performSignatureP1(chat, p1KeyShare) {
    const sessionId = "session id for signature";
    const messageHash = Uint8Array.from([
        209, 208, 90, 82, 131, 171, 223, 205, 184, 236, 127, 63, 223, 171, 56, 179,
        184, 170, 54, 127, 4, 6, 152, 70, 97, 31, 187, 151, 16, 91, 91, 20,
    ]);
    console.log("messageHash to sign: ", messageHash);
    const p1 = new ecdsa_tss_1.P1Signature(sessionId, messageHash, p1KeyShare);
    //round 1
    const msg1 = await p1.processMessage(null);
    sendMessage(msg1.msg_to_send, chat);
    const msg2_received = await receiveMessage();
    // round 2
    const msg3 = await p1.processMessage(msg2_received);
    console.log("sending message 3 (P1)");
    sendMessage(msg3.msg_to_send, chat);
    const msg4_received = await receiveMessage();
    // round 3
    const msg5 = await p1.processMessage(msg4_received);
    sendMessage(msg5.msg_to_send, chat);
    const p1Sign = msg5.signature;
    console.log("----- [tss] SIGN GEN FIN ----");
    console.log("p1Sign -----", p1Sign);
    console.log("[tss] msg5 sent (final)");
    return p1Sign;
}
exports.performSignatureP1 = performSignatureP1;
async function performSignatureP2(chat, p2KeyShare) {
    const sessionId = "session id for signature";
    const messageHash = Uint8Array.from([
        209, 208, 90, 82, 131, 171, 223, 205, 184, 236, 127, 63, 223, 171, 56, 179,
        184, 170, 54, 127, 4, 6, 152, 70, 97, 31, 187, 151, 16, 91, 91, 20,
    ]);
    console.log("messageHash to sign: ", messageHash);
    const p2 = new ecdsa_tss_1.P2Signature(sessionId, messageHash, p2KeyShare);
    // round 1
    const msg1_received = await receiveMessage();
    const msg2 = await p2.processMessage(msg1_received);
    sendMessage(msg2.msg_to_send, chat);
    // round 2
    const msg3_received = await receiveMessage();
    const msg4 = await p2.processMessage(msg3_received);
    sendMessage(msg4.msg_to_send, chat);
    //round 3
    const msg5_received = await receiveMessage();
    console.log("[tss] message5 (final) received");
    const msg6 = await p2.processMessage(msg5_received);
    console.log("[tss] SIGN GEN FIN ------------");
    const p2Sign = msg6.signature;
    console.log("p2Sign", "0x" + p2Sign);
    return p2Sign;
}
exports.performSignatureP2 = performSignatureP2;
async function signature() {
    const sessionId = "session id for signature";
    const messageHash = await (0, ecdsa_tss_1.randBytes)(32);
    console.log(messageHash);
    const keyshares = await performKeygen();
    if (keyshares === null) {
        throw new Error("Keygen failed");
    }
    const p1 = new ecdsa_tss_1.P1Signature(sessionId, messageHash, keyshares[0]);
    const p2 = new ecdsa_tss_1.P2Signature(sessionId, messageHash, keyshares[1]);
    // Round 1
    const msg1 = await p1.processMessage(null);
    const msg2 = await p2.processMessage(msg1.msg_to_send);
    // Round 2
    const msg3 = await p1.processMessage(msg2.msg_to_send);
    const msg4 = await p2.processMessage(msg3.msg_to_send);
    // Round 3
    const msg5 = await p1.processMessage(msg4.msg_to_send);
    const p1Sign = msg5.signature;
    const msg6 = await p2.processMessage(msg5.msg_to_send);
    const p2Sign = msg6.signature;
    if (!p1Sign || !p2Sign) {
        return null;
    }
    console.log("p1Sign", "0x" + p1Sign);
    console.log("p2Sign", "0x" + p2Sign);
}
exports.signature = signature;
