import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ChatForWaku from './chatForWaku.js';

const argv = yargs(hideBin(process.argv))
    .option('party', {
        alias: 'p',
        description: 'Party name',
        type: 'string',
        default: '1',
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
        default: false
    })
    .option('repeatSign', {
        alias: 'r',
        description: 're-start listening for sign if acting as party2 flag',
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help', 'h')
    .parseSync();

console.log('Arguments:', argv);

// GLOBAL 
let chat: ChatForWaku;

// setup chat

function main() {

    async function setupChatForWaku() {
        const Waku = (await import ("./waku.js")).default
        const waku = await (new Waku()).init();
    
        const ChatForWaku = (await import("./chatForWaku.js")).default
    
        let name = "P" + argv.party;

        chat = new ChatForWaku(waku, name)
        console.log("chat set up --- waku")
    }

    setupChatForWaku();
}    

main();

