"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// let provider = new ethers.JsonRpcProvider("127.0.0.1:8545")
// let signer = provider.getSigner()
class Signer {
    constructor(key) {
        this.signer = new ethers_1.ethers.Wallet((0, ethers_1.id)(key)); //https://docs.ethers.org/v6/getting-started/#starting-signing
        this.address = this.signer.address;
    }
    async signMessage(message) {
        return await this.signer.signMessage(message);
    }
}
exports.default = Signer;
