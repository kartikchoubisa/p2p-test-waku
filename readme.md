# p2p-tss
sdk for using ecdsa-tss (both js and wasm) with p2p communication (with waku)

# Overview of p2p-tss (waku-tss) and nextapp
This project consists of two main components: `lib` and `nextapp`. `lib` is an npm package, and `nextapp` is a separate repository that can use `lib` in two different ways.

## 1. `lib` (waku-tss)

### Purpose
`lib` serves as an npm package that can be utilized both as a standalone server environment and as a library within the `nextapp` frontend application.

### Directory Structure
- `lib` has the following directory structure:
  - `run`: Contains code to run `lib` in a server environment.
  - Additional directories and files specific to `lib` functionality.

## 2. `nextapp`

### Purpose
`nextapp` is a separate repository that can utilize `lib` in two different ways, depending on the branch used: `dev` and `local-lib`.

### Directory Structure
- `src`: The main source directory for the `nextapp` application.

### Usage of `lib` in `nextapp`

#### a. `dev` Branch

- In the `dev` branch of `nextapp`, `lib` (waku-tss) is installed as an npm package via the `package.json` file. This allows `nextapp` to use the published version of `lib` from a GitLab repository URL.

#### b. `local-lib` Branch

- In the `local-lib` branch of `nextapp`, `lib` is used directly by including the `waku-tss` repository in the `src` directory of `nextapp`. TypeScript files from `lib` are compiled as part of the `nextapp` build process.
- This approach is designed to facilitate continuous testing of `lib` within the `nextapp` codebase. Changes made to `lib` can be immediately tested without the need to reinstall the entire package, enhancing development efficiency.



## installation

## usage

## Changelog

## Version 0.0.4
(untested) stable for use as lib
(tested) stable for use in server (ONLY AS Party2 in server)

In run.ts:
- Updated main to call the setupChatForWaku, runKeygen, and runSign functions in sequence

In waku.ts:
- Added an enum remotePeerDomains to define available remote peer options
- Updated the constructor to accept a remotePeerId argument and set a default value of "NEW"
- Added logic to handle custom and default peer ids in the constructor


## Version 0.0.3
stable for use as library
WIP run script

* added multiformats/multiaddr as an npm dependency
* added a run.ts file to run the server
* added run script: (`npm run start`) and edited build script (`npm run build`)
* changed tsconfig to debug some build issues with run.ts


## Version 0.0.2
WIP 

compiled the ts to js for use as module 
### Version 0.0.1
WIP

Currently supports:
* choosing between waku and wc
* chosing between the js and wasm implementation of tss



TODOs:
* Implement encrypted channel for Waku.
* Implement communication of session-id for keygen and signature, and messageHash for signature in the tss files.
* Implement tss in an iterative round-by-round way, so that you only need to call 'startRound()' for both party1 and party2.
