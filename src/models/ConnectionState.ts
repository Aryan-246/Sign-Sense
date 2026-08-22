/**
 * All connection states the UI must be able to represent (see spec §10, §15).
 * "Receiving / Waiting for Data" is NOT a connection state — it is derived from
 * the timestamp of the last received message while Connected.
 */
export enum ConnectionStatus {
  Disconnected = 'DISCONNECTED',
  Scanning = 'SCANNING',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  ConnectionLost = 'CONNECTION_LOST',
  Reconnecting = 'RECONNECTING',
  Error = 'ERROR',
}

/** Human-readable labels for each status. */
export const CONNECTION_STATUS_LABEL: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Disconnected]: 'Disconnected',
  [ConnectionStatus.Scanning]: 'Scanning',
  [ConnectionStatus.Connecting]: 'Connecting',
  [ConnectionStatus.Connected]: 'Connected',
  [ConnectionStatus.ConnectionLost]: 'Connection Lost',
  [ConnectionStatus.Reconnecting]: 'Reconnecting',
  [ConnectionStatus.Error]: 'Error',
};

export function isActiveConnection(status: ConnectionStatus): boolean {
  return status === ConnectionStatus.Connected;
}
