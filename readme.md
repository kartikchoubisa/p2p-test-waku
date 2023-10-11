## p2p-tss
sdk for using ecdsa-tss (both js and wasm) with p2p communication (with waku)

## installation

## usage

## Changelog
### Version 0.0.1
WIP

Currently supports:
* choosing between waku and wc
* chosing between the js and wasm implementation of tss



TODOs:
* Implement encrypted channel for Waku.
* Implement communication of session-id for keygen and signature, and messageHash for signature in the tss files.
* Implement tss in an iterative round-by-round way, so that you only need to call 'startRound()' for both party1 and party2.
