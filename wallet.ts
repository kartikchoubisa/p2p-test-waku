import {ethers, id} from "ethers"

// let provider = new ethers.JsonRpcProvider("127.0.0.1:8545")
// let signer = provider.getSigner()

class Signer {
    public address: string;
    private signer: ethers.Wallet;
    
    constructor(key : string){
        this.signer = new ethers.Wallet(id(key)) //https://docs.ethers.org/v6/getting-started/#starting-signing
        this.address = this.signer.address
    }

    async signMessage(message: string){
        return await this.signer.signMessage(message);
    }
}

export default Signer