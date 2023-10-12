declare class Signer {
    address: string;
    private signer;
    constructor(key: string);
    signMessage(message: string): Promise<string>;
}
export default Signer;
