import PRPCNode from './rpc';
import PInfuraNode from './infura';
import PEtherscanNode from './etherscan';
import PCustomNode from './custom';
import PWeb3Node from './web3';
import { nodeCallRequester } from '@src/saga';
import { INode } from '@src/types';

const handler: ProxyHandler<INode> = {
  get: (target, methodName: string) => {
    const nodeMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(target),
    );
    if (nodeMethods.includes(methodName)) {
      return nodeCallRequester(methodName);
    }
  },
};

const createNode = (ctor: any, args: any) => {
  const instance = new ctor(...args);
  return new Proxy(instance, handler);
};

const obj = {
  RPCNode: PRPCNode,
  InfuraNode: PInfuraNode,
  EtherscanNode: PEtherscanNode,
  CustomNode: PCustomNode,
  Web3Node: PWeb3Node,
};

type Nodefactory<T> = (endpoint: string) => T;
interface INodeInterfaces {
  RPCNode: Nodefactory<PRPCNode>;
  InfuraNode: Nodefactory<PInfuraNode>;
  EtherscanNode: Nodefactory<PEtherscanNode>;
  CustomNode: Nodefactory<PCustomNode>;
  Web3Node: Nodefactory<PWeb3Node>;
}

const x: INodeInterfaces = Object.entries(obj).reduce(
  (acc, [key, value]) => {
    return {
      ...acc,
      [key](...args) {
        return createNode(value, args);
      },
    };
  },
  {} as INodeInterfaces,
);

const { CustomNode, EtherscanNode, InfuraNode, RPCNode, Web3Node } = x;

export { CustomNode, EtherscanNode, InfuraNode, RPCNode, Web3Node };
