import { Store } from '@subsquid/typeorm-store'
import { ERC1155Contract } from '../model'
import {ERC1155contract} from '../utils/entitiesManager'

// export async function isKnownContract(db: Store, contractAddress: string, block: number): Promise<boolean> {
//   const contract = await ERC1155contract.get(db,ERC1155Contract,contractAddress.toLowerCase())
//   return contract != null && contract.startBlock < block
// }

