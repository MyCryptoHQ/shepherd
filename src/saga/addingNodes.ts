import { NodeConfig } from '@src/types/nodes';
import {
  call,
  spawn,
  select,
  take,
  put,
  apply,
  race,
} from 'redux-saga/effects';
import {
  INodeStats,
  getNodeStatsById,
} from '@src/ducks/nodeBalancer/nodeStats';
import {
  NodeCall,
  nodeCallSucceeded,
  nodeCallTimeout,
} from '@src/ducks/nodeBalancer/nodeCalls';
import { Channel, buffers, channel, Task, delay } from 'redux-saga';
import { IWorker, workerProcessing } from '@src/ducks/nodeBalancer/workers';
import { channels } from '@src/saga';
import { IChannels, Workers } from '@src/saga/types';
import { getNodeConfigById } from '@src/ducks/nodeConfigs/configs';
import { checkNodeConnectivity } from '@src/saga/nodeHealth';

/**
 *
 * @description Handles checking if a node is online or not, and adding it to the node balancer
 * @param {string} nodeId
 * @param {NodeConfig} nodeConfig
 */
export function* handleAddingNode(nodeId: string, nodeConfig: NodeConfig) {
  const startTime = new Date();
  const nodeIsOnline: boolean = yield call(
    checkNodeConnectivity,
    nodeId,
    false,
  );
  const endTime = new Date();
  const avgResponseTime = +endTime - +startTime;
  const stats: INodeStats = {
    avgResponseTime,
    isOffline: !nodeIsOnline,
    isCustom: nodeConfig.isCustom,
    timeoutThresholdMs: 2000,
    currWorkersById: [],
    maxWorkers: 100,
    requestFailures: 0,
    requestFailureThreshold: 2,
    supportedMethods: {
      client: true,
      requests: true,
      ping: true,
      sendCallRequest: true,
      getBalance: true,
      estimateGas: true,
      getTransactionCount: true,
      getCurrentBlock: true,
      sendRawTx: true,
    },
  };

  const nodeChannel: Channel<NodeCall> = yield call(
    channel,
    buffers.expanding(10),
  );

  channels[nodeId] = nodeChannel;

  const workers: Workers = {};
  for (
    let workerNumber = stats.currWorkersById.length;
    workerNumber < stats.maxWorkers;
    workerNumber++
  ) {
    const workerId = `${nodeId}_worker_${workerNumber}`;
    const workerTask: Task = yield spawn(
      spawnWorker,
      workerId,
      nodeId,
      nodeChannel,
    );
    console.log(`Worker ${workerId} spawned for ${nodeId}`);
    stats.currWorkersById.push(workerId);
    const worker: IWorker = {
      assignedNode: nodeId,
      currentPayload: null,
      task: workerTask,
    };
    workers[workerId] = worker;
  }

  return { nodeId, stats, workers };
}

function* spawnWorker(thisId: string, nodeId: string, chan: IChannels[string]) {
  /**
   * @description used to differentiate between errors from worker code vs a network call error
   * @param message
   */
  const createInternalError = (message: string) => {
    const e = Error(message);
    e.name = 'InternalError';
    return e;
  };

  //select the node config on initialization to avoid re-selecting on every request handled
  const nodeConfig: NodeConfig | undefined = yield select(
    getNodeConfigById,
    nodeId,
  );

  if (!nodeConfig) {
    throw Error(`Node ${nodeId} not found when selecting from state`);
  }

  let currentPayload: NodeCall;
  while (true) {
    try {
      // take from the assigned action channel
      const payload: NodeCall = yield take(chan);
      currentPayload = payload;
      // after taking a request, declare processing state
      yield put(
        workerProcessing({ currentPayload: payload, workerId: thisId }),
      );

      const nodeStats: Readonly<INodeStats> | undefined = yield select(
        getNodeStatsById,
        nodeId,
      );

      if (!nodeStats) {
        throw createInternalError(`Could not find stats for node ${nodeId}`);
      }

      const lib = nodeConfig.pLib;

      // make the call in the allotted timeout time
      // this will create an infinite loop
      const { result, timeout } = yield race({
        result: apply(lib, lib[payload.rpcMethod], payload.rpcArgs),
        timeout: call(delay, nodeStats.timeoutThresholdMs),
      });

      //TODO: clean this up
      if (timeout || !result) {
        throw createInternalError(`Request timed out for ${nodeId}`);
      }
      console.log('Finished', thisId, payload.callId);
      yield put(
        nodeCallSucceeded({ result, nodeCall: { ...payload, nodeId: thisId } }),
      );
    } catch (error) {
      const e: Error = error;
      if (!(e.name === 'InternalError')) {
        e.name = `NetworkError_${e.name}`;
      }
      console.error(e);
      yield put(nodeCallTimeout({ ...currentPayload!, nodeId, error }));
    }
  }
}
