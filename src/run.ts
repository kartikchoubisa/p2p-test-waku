import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ChatForWaku from './chatForWaku.js';
import Waku, { remotePeerDomains } from './waku.js';
import { performKeygenP2, performSignatureP2} from './tss.js';
import { P2KeyShare } from '@com.silencelaboratories/ecdsa-tss/lib/cjs/ecdsa/P2KeyShare.js';

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
        default: false
    })
    .option('repeatSign', {
        alias: 'r',
        description: 're-start listening for sign if acting as party2 flag',
        type: 'boolean',
        default: false
    })
    .option('remotePeer', {
        alias: 'd',
        description: 'Remote peer',
        type: "string",
        default: 'NEW', // se the default peer id 
        choices: Object.keys(remotePeerDomains)
    })
    .help()
    .alias('help', 'h')
    .parseSync();

console.log('Arguments:', argv);

// GLOBAL 
let chat: ChatForWaku;
let keyshare: P2KeyShare;

async function main() {

    // setup chat

    async function setupChatForWaku() {
        const waku = await (new Waku(argv.remotePeer)).init();
    
        let name = "P" + argv.party;

        chat = new ChatForWaku(waku, name)
        console.log("chat set up --- waku")
    }

    async function runKeygen(){
        // start listening for keygen (as P2)
        console.time("keygen")
        // @ts-expect-error
        keyshare = await performKeygenP2(chat)
        console.log("keygenResponse (keyshare)", keyshare)
        console.timeEnd("keygen")
    
    }

    async function runSign(){
        //start listening for sign as P2
        console.time("sign")
        // @ts-expect-error
        let signResponse = await performSignatureP2(chat, keyshare)
        console.log("signResponse", signResponse)
        console.timeEnd("sign")
    }

    await setupChatForWaku();
    await runKeygen()
    while (true) {
        await runSign()
    }
    
    
 
}   
 
main();
