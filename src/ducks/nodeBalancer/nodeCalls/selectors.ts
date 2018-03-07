import { RootState } from '@src/ducks';
import { getNodeBalancer } from '@src/ducks/nodeBalancer/selectors';
import { NodeCall } from '@src/ducks/nodeBalancer/nodeCalls';

export const getNodeCalls = (state: RootState) =>
  getNodeBalancer(state).nodeCalls;

export const getNodeCallById = (state: RootState, id: number) =>
  getNodeCalls(state)[id];

export const getNodeCallByPayload = (state: RootState, addr: string) =>
  Object.values(getNodeCalls(state)).find(
    (nodeCall: NodeCall) => nodeCall.rpcArgs[0] === addr,
  );

export const getPendingNodeCallsByNodeId = (
  state: RootState,
  nodeId: string,
) => {
  const nodeCalls = getNodeCalls(state);
  const nodeCallsArr = Object.values(nodeCalls);
  const callsByNodeId = nodeCallsArr.filter(
    nodeCall => nodeCall.nodeId && nodeCall.nodeId === nodeId,
  );
  return callsByNodeId.length;
};
