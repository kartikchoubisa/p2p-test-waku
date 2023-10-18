# p2p-tss
sdk for using ecdsa-tss (both js and wasm) with p2p communication (with waku)

## testWaku branch
Does not have tss library dependency to allow sending waku message for testing 

### how to run

```
npm install
 ts-node --esm src/run.ts -d="SL_SG"
```
`-d` is the node. see src/waku.ts `remotePeerDomains` for available options