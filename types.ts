
export interface Wallet {
  address: string;
  privateKey: string;
}

export type Network = 'testnet' | 'mainnet';

export type NodeStatus = 'Online' | 'Offline';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}
