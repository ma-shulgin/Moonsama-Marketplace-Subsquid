import { Store } from '@subsquid/typeorm-store'
import { Contract } from '../model'
import {contracts} from '../utils/entitiesManager'

export async function isKnownContract(db: Store, contractAddress: string, block: number): Promise<boolean> {
  const contract = await contracts.get(db,Contract,contractAddress.toLowerCase())
  return contract != null && contract.startBlock < block
}

