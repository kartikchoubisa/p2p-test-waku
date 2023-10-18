import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ChatForWaku from './chatForWaku.js';
import Waku, { remotePeerDomains } from './waku.js';

const argv = yargs(hideBin(process.argv))
    .option('party', {
        alias: 'p',
        description: 'Party name',
        type: 'string',
        default: '2', // change default party here
        choices: ['1', '2']

    })
    .option('runKeygen', {
        alias: 'k',
        description: 'Run keygen',
        type: 'boolean',
        default: true
    })
    .option('runSign', {
        alias: 's',
        description: 'Run sign',
        type: 'boolean',
        default: true
    })
    .option('repeatSign', {
        alias: 'r',
        description: 're-start listening for sign if acting as party2 flag',
        type: 'boolean',
        default: true
    })
    .option('remotePeer', {
        alias: 'd',
        description: 'Remote peer',
        type: "string",
        default: 'NEW', // se the default peer id 
        choices: Object.keys(remotePeerDomains)
    })
    .option('testSend', {
        alias: 't',
        description: 'Send a test message',
        type: 'boolean',
        default: false,
    })
    .help()
    .alias('help', 'h')
    .parseSync();

console.log('Arguments:', argv);

// GLOBAL 
let chat: ChatForWaku;

async function main() {

    // setup chat-
    async function setupChatForWaku() {
        const waku = await (new Waku(argv.remotePeer)).init();
    
        let name = "P" + argv.party;

        chat = new ChatForWaku(waku, name)
        console.log("chat set up --- waku")
    }


    await setupChatForWaku();

    await chat.sendMessage("test message");

}   
 
main();
