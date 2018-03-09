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
