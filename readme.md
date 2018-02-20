# Alpha Software

Ensure high-availability for your JSON-RPC calls while improving user-experience. Shepherd automatically cancels calls that are taking too long to respond and executes them against fresh node infrastructure. Shepherd is incredibly configurable — you can set filters on node infrastructure to ensure that sensitive JSON-RPC calls are contained, dynamically bias against poorly performing node infrastructure, and more!

Shepherd is built to have high configurability for users.

## Initialization
- Configure the balancer on instantiation with a list of RPC nodes to balance against
- Able to use Infura / Etherscan / MyCrypto / Local node endpoints out of the box, with support for injecting custom node instances to use for a configuration as long as it follows the `INode` interface typing.

## Per RPC Call
- Set the amount of retries of a specific RPC call before failing it 
- Configure the response time limit of a specific call (includes the time spend on retried calls) 
- Prioritize or de-prioritize the call to a node based on parameters such as the last node that failed this call (deprioritize) or if a certain node is more performant than others

## Per Node 
- Set amount of timed-out calls before a node is listed as offline 
- Set response time limit spent per call before declaring it as timed-out 
- Enable / disable available RPC-methods per node to bias for or against certain node infrastructures Ex. Disable estimate_gas for an Infura node so that it'll never process them 
- Dynamically add or remove nodes to the balancer configuration 

