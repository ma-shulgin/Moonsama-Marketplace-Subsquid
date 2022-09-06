import { Store } from '@subsquid/typeorm-store'
import { ERC721Contract } from '../model'
import { ERC721contracts } from '../utils/entitiesManager'

export async function isKnownContract(db: Store, contractAddress: string, block: number): Promise<boolean> {
  const contract = await ERC721contracts.get(db,ERC721Contract,contractAddress.toLowerCase())
  return contract != null && contract.startBlock < block
}

