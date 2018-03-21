# Alpha Software

Ensure high-availability for your JSON-RPC calls while improving user-experience. Shepherd automatically cancels calls that are taking too long to respond and executes them against fresh provider infrastructure. Shepherd is incredibly configurable — you can set filters on provider infrastructure to ensure that sensitive JSON-RPC calls are contained, dynamically bias against poorly performing provider infrastructure, and more!

Shepherd is built to have high configurability for users.

## Initialization

* Configure the balancer on instantiation with a list of RPC providers to balance against
* Able to use Infura / Etherscan / MyCrypto / Local provider endpoints out of the box, with support for injecting custom provider instances to use for a configuration as long as it follows the `IProvider` interface typing.

## Per RPC Call

* Set the amount of retries of a specific RPC call before failing it
* Configure the response time limit of a specific call (includes the time spend on retried calls)
* Prioritize or de-prioritize the call to a provider based on parameters such as the last provider that failed this call (deprioritize) or if a certain provider is more performant than others

## Per Provider

* Set amount of timed-out calls before a provider is listed as offline
* Set response time limit spent per call before declaring it as timed-out
* Enable / disable available RPC-methods per provider to bias for or against certain provider infrastructures Ex. Disable estimate_gas for an Infura provider so that it'll never process them
* Dynamically add or remove providers to the balancer configuration

## On network switch

On network switch, all pending calls and worker instances are cancelled,
all pending provider additions are also cancelled
todo: check for if flushing can be forked or has to be synchronous with network switching

## Request behavior during dynamic switching of provider configs

On the switching of provider configs, previously valid requests that were queued for a changed provider that become invalid are either
a) continued to be processed
b) re-queued into the balancer for another provider to take
Behaviour chosen TBD

## Timeout behavior

The tracking of timeouts is currently started when a request is made to a provider, not when the request is initially received to the balancer

## Node balancer status

When the set of all online provider's rpc methods is a proper subset of the set of all available rpc methods (globally set), the balancer is set to a state of offline
All pending and incoming requests remain queued until either:
a) the network switches
b) the balancer comes back online (if it takes too long, we might want to reject the request automatically so the callee isnt waiting forever)
TODO: implement
