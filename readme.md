[![Coverage Status](https://coveralls.io/repos/github/MyCryptoHQ/shepherd/badge.svg?branch=master)](https://coveralls.io/github/MyCryptoHQ/shepherd?branch=master)
[![Build Status](https://travis-ci.org/MyCryptoHQ/shepherd.svg?branch=master)](https://travis-ci.org/MyCryptoHQ/shepherd)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Alpha Software

Ensure high-availability for your JSON-RPC calls while improving user-experience. Shepherd automatically cancels calls that are taking too long to respond and executes them against fresh provider infrastructure. Shepherd is incredibly configurable — you can set filters on provider infrastructure to ensure that sensitive JSON-RPC calls are contained, dynamically bias against poorly performing provider infrastructure, and more!

Shepherd is built to have high configurability for users.

# Installation

`npm i mycrypto-shepherd`

# Shepherd API

### init()

Initializes the balancer, returning a single instance of a provider to be used across your application

##### Parameters

| Name                                   | Type          | Description                                                                                                                                                                                                                                                                                                                                            |            |
| -------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| { customProviders, ...config }&#x3D;{} | `IInitConfig` | Initialization configuration parameter, custom providers are your own supplied implementations that adhere to the {IProvider} interface. The {providerCallRetryThreshold} determines how many times a provider can fail a call before its determined to be offline. The {network} is what network the balancer will initialize to, defaulting to 'ETH' | _Optional_ |

##### Returns

* `Promise.<IProvider>` A provider instance to be used for making rpc calls

### addProvider(providerName, Provider)

Adds a custom Provider implementation to be later used and instantiated by useProvider. This library comes with default Provider implementations of 'rpc' 'etherscan' 'infura' 'web3' 'myccustom'
already availble for use in useProvider. This method can be used before init

##### Parameters

| Name         | Type                  | Description                                          |
| ------------ | --------------------- | ---------------------------------------------------- |
| providerName | `string`              |                                                      |
| Provider     | `IProviderContructor` | The provider implementation to store for later usage |

##### Returns

* `Void`

### auto()

Switches the balancer back to "auto" mode. This is the default mode of the balancer. If the balancer was previously in "manual" mode, this will now instead change it back to normal
behaviour, which means balancing between all available providers of the current network

##### Returns

* `Void`

### manual(providerId, skipOfflineCheck)

Switches the balancer to "manual" mode. This will switch the balancer's current network to the manual providers network if it is different, then route all requests to the provider. This method
can be used before init

##### Parameters

| Name             | Type      | Description                                                                    |
| ---------------- | --------- | ------------------------------------------------------------------------------ |
| providerId       | `string`  |                                                                                |
| skipOfflineCheck | `boolean` | Will not fail and throw an error if the manual provider switched to is offline |

##### Returns

* `Promise.<string>` Resolves when the manual provider has successfully been switched to, returns a promise containing the provider ID switched to

### useProvider(providerName, instanceName, config, args)

Add a provider instance to the balancer to be used for incoming rpc calls, this is distinctly different from addProvider, as addProvider does not add any providers to be
used for incoming calls. All addProvider does is add a custom implementation to the pool of default
implementations that you can specify in this method to be used and have instances created from.
This method can be used before init

##### Parameters

| Name         | Type              | Description                                                                                                                                                                                                             |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| providerName | `string`          | The name of the Provider implementation to use as previously defined in either init (as customProviders), or addProvider, or one of the default implementations supplied: 'rpc' 'etherscan' 'infura' 'web3' 'myccustom' |
| instanceName | `string`          | The unique name of the instance to be used                                                                                                                                                                              |
| config       | `IProviderConfig` |                                                                                                                                                                                                                         |
| args         | `Array.<any>`     | The constructor arguments to be supplied to the specifed Provider constructor                                                                                                                                           |

##### Returns

* `Void`

### switchNetworks(network)

Switch the network for the balancer to use, all provider instances added by useProvider that match the same network to be swiched to will be used. Can not be used when the balancer is in
manual mode, switch to auto mode first.

##### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| network | `string` |             |

##### Returns

* `Promise.<undefined>` Resolves when the network is finished being switched to

### enableLogging()

Enables logging for the library

##### Returns

* `Void`

# IProviderConfig

| Name                    | Type     | Description                                                                                                                                                                                                                                                                                                              |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| concurrency             | `string` | The maximum number of concurrent calls to make to the provider instance using this config. This number determines how many workers to spawn to process incoming rpc requests                                                                                                                                             |
| requestFailureThreshold | `string` | The threshold of failed calls before deeming a provider to be offline (which means it will no longer have rpc calls routed to it), which will then be polled until it responds. If it responds, it will be changed to an online state and continue to have applicable calls as outlined in supportedMethods routed to it |
| timeoutThresholdMs      | `string` | How long to wait on an rpc call (also applies to the initial ping to determine if a provider is online) before determining that it has timed out                                                                                                                                                                         |
| supportedMethods        | `string` | All supported rpc methods by this provider config, disable a method for a config by setting it to false, this will prevent any rpc calls set to false to be routed to the provider instance using this config                                                                                                            |
| network                 | `string` | The associated network name of this provider config to be used by the balancer when switching networks                                                                                                                                                                                                                   |

# FAQ

## Timeout behavior

The tracking of timeouts is currently started when a request is made to a provider, not when the request is initially received to the balancer.
If a call to the balancer times out before being processed by a worker, the entire queue is flushed.

## Node balancer status

When the set of all online provider's rpc methods is a proper subset of the set of all available rpc methods (globally set), the balancer is set to a state of offline
All pending and incoming requests remain queued until either:
a) the network switches
b) the balancer comes back online (if it takes too long, as set by queueTimeout, the pending calls are flushed and cancelled, returning as a promise rejection to the user)

## requestFailureThreshold vs providerCallRetryThreshold

providerCallRetryThreshold determines how many times a provider can fail a call before its determined to be offline, while a request failure threshold is how many times a specific call can be retried before it fails. In the context of a single request failing with both providerCallRetryThreshold and request failure threshold being set to the same number, the provider will be set offline one iteration before providerCallRetryThreshold would take effect, because one keeps track of failures, while the other keeps track of retries.
