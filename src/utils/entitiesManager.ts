import { Store, EntityClass } from '@subsquid/typeorm-store'
import { assert } from 'console'
import { FindOptionsRelations, FindOptionsWhere } from 'typeorm'

import {
  Contract,
  Transfer,
  Owner,
  Token,
  Metadata,
  OwnerTransfer,
} from '../model'

interface EntityWithId {
  id: string
}

class EntitiesBuffer<Entity extends EntityWithId> {
  protected saveBuffer: Set<Entity> = new Set()

  save(entity: Entity): void {
    this.saveBuffer.add(entity)
  }

  async saveAll(db: Store): Promise<void> {
    await db.save([...this.saveBuffer])
    this.saveBuffer.clear()
  }
}

class EntitiesCache<
  Entity extends EntityWithId
> extends EntitiesBuffer<Entity> {
  protected cache: Map<string, Entity> = new Map()

  protected addCache(entity: Entity): void {
    this.cache.set(entity.id, entity)
  }

  save(entity: Entity): void {
    this.saveBuffer.add(entity)
    this.addCache(entity)
  }

  async get(
    db: Store,
    entity: EntityClass<Entity>,
    id: string,
    relations?: FindOptionsRelations<Entity>,
    dieIfNull?: boolean
  ): Promise<Entity | undefined> {
    let item = this.cache.get(id)
    if (!item) {
      item = await db.get(entity, {
        where: { id } as FindOptionsWhere<Entity>,
        relations,
      })
    }
    if (item) {
      this.addCache(item)
    } else if (dieIfNull) {
      throw new Error('Not null assertion')
    }
    return item
  }

  async saveAll(db: Store, clear?: boolean): Promise<void> {
    await db.save([...this.saveBuffer])
    this.saveBuffer.clear()
    if (clear) {
      this.cache.clear()
    }
  }
}

class TokensCache extends EntitiesCache<Token> {
  async getAllContractTokens(
    db: Store,
    contractAddress: string
  ): Promise<Array<Token>> {
    const cachedTokens: Token[] = []
    this.cache.forEach((token, tokenId) => {
      if (tokenId.startsWith(contractAddress)) {
        cachedTokens.push(token)
      }
    })
    const allTokens = await db.find(Token, {
      where: {
        contract: {
          id: contractAddress,
        },
      },
    })

    // Replace db tokens that exists in cache
    cachedTokens.forEach((token) => {
      const replaceId = allTokens.findIndex((dbToken) => dbToken.id === token.id)
      // Tokens only that exist in db could be cached
      assert(replaceId >= 0)
      allTokens[replaceId] = token
    })

    // Add everything from db to in-memory cache
    allTokens.forEach((token)=>{
      this.addCache(token)
    })
    
    return allTokens
  }
}

export const contracts = new EntitiesCache<Contract>()
export const transfers = new EntitiesBuffer<Transfer>()
export const ownerTransfers = new EntitiesBuffer<OwnerTransfer>()
export const owners = new EntitiesCache<Owner>()
export const tokens = new TokensCache()
export const metadatas = new EntitiesCache<Metadata>()

export async function saveAll(db: Store): Promise<void> {
  await contracts.saveAll(db)
  await metadatas.saveAll(db, true)
  await owners.saveAll(db, true)
  await tokens.saveAll(db, true)
  await transfers.saveAll(db)
  await ownerTransfers.saveAll(db)
}
