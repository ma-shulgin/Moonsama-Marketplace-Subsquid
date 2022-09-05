import { CommonHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { BigNumber } from 'ethers'
import { Metadata, Token } from '../model'
import { metadatas } from '../utils/entitiesManager'
import * as raresamaCollection from '../types/generated/raresama-collection'
import { parseMetadata } from './metadata.helper'

export function getTokenId(contract: string, nativeId: BigInt): string {
  return `${contract}-${String(nativeId).padStart(9, '0')}`
}

export async function updateTokenMetadata(
  ctx: CommonHandlerContext<Store>,
  token: Token,
  contractAPI: raresamaCollection.Contract
): Promise<void> {
  token.updatedAt = BigInt(ctx.block.timestamp)
  const tokenUri = await contractAPI.tokenURI(BigNumber.from(token.id.slice(-9)))
  token.tokenUri = tokenUri
  if (tokenUri) {
    let metadata = await metadatas.get(ctx.store, Metadata, token.tokenUri)
    if (!metadata) {
      metadata = await parseMetadata(ctx, token.tokenUri)
      if (metadata) metadatas.save(metadata)
    }
    token.metadata = metadata
  }
}
