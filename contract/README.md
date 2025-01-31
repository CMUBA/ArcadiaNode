## How to use

cd contract/optimism
./script/deploy.sh optimism-testnet

cd contract/optimism
./script/deploy.sh optimism-mainnet

### Deploy example

```
└> ./script/deploy.sh optimism-testnet
Deploying to optimism-testnet...
Compiling contracts...
[⠒] Compiling...
No files changed, compilation skipped
Running deployment script...
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [504030] NodeRegistryScript::run()
    ├─ [0] VM::envAddress("STAKE_MANAGER_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return] 
    ├─ [458423] → new NodeRegistry@0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
    │   └─ ← [Return] 2178 bytes of code
    ├─ [0] console::log("NodeRegistry deployed at:", NodeRegistry: [0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d]) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Using StakeManager at:", 0x1234567890123456789012345678901234567890) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return] 
    └─ ← [Stop] 


Script ran successfully.

== Logs ==
  NodeRegistry deployed at: 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
  Using StakeManager at: 0x1234567890123456789012345678901234567890

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [458423] → new NodeRegistry@0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
    └─ ← [Return] 2178 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.000001727 gwei

Estimated total gas used for script: 712206

Estimated amount required: 0.000000001229979762 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x212736ca7a8c4eb562bd07f6198b469637e26cb9237a84fb83e9dba2e347f7e4
Contract Address: 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
Block: 23268709
Paid: 0.000000000799530541 ETH (547999 gas * 0.000001459 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000000000799530541 ETH (547999 gas * avg 0.000001459 gwei)
                                                                            

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (1) contracts
Start verifying contract `0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d` deployed on optimism-sepolia

Submitting verification for [src/NodeRegistry.sol:NodeRegistry] 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d.
Submitted contract for verification:
        Response: `OK`
        GUID: `vwfnxyvy2ds4ev7ggp75bqnhuzaakd9smenhycvrha7rna8kvl`
        URL: https://sepolia-optimism.etherscan.io/address/0x3f882ac9f78c7e44e8dedc852b0c7f04349e2d3d
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
All (1) contracts were verified!

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/broadcast/NodeRegistry.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/cache/NodeRegistry.s.sol/11155420/run-latest.json

Deployment successful!

```


## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
