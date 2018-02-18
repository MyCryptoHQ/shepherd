import { RootState } from '@src/ducks';
import { getCurrentNetworkId } from '@src/ducks/networkConfigs/currentId';
import { getNodeConfigs } from '@src/ducks/nodeConfigs/configs';
import { NodeConfig } from '@src/types/nodes';

export const getAllNodesOfCurrentNetwork = (state: RootState) => {
  const allNodesOfNetworkId: { [key: string]: NodeConfig } = {};
  const networkId = getCurrentNetworkId(state);
  const nodeConfigs = getNodeConfigs(state);

  return Object.entries(nodeConfigs).reduce(
    (allNodes, [currNodeId, currNodeConfig]) => {
      if (currNodeConfig.network !== networkId) {
        return allNodes;
      }
      return { ...allNodes, [currNodeId]: currNodeConfig };
    },
    allNodesOfNetworkId,
  );
};
