import { CommonHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { BigNumber } from 'ethers'
import { Metadata, ERC721Token, ERC1155Token } from '../model'
import { metadatas } from '../utils/entitiesManager'
import * as erc721 from '../abi/erc721'
import * as erc1155 from '../abi/erc1155'
import { parseMetadata } from './metadata.helper'

export function getTokenId(contract: string, nativeId: BigInt): string {
  return `${contract}-${String(nativeId).padStart(9, '0')}`
}

// export async function updateERC721TokenMetadata(
//   ctx: CommonHandlerContext<Store>,
//   token: ERC721Token,
//   contractAPI: erc721.Contract
// ): Promise<void> {
//   token.updatedAt = BigInt(ctx.block.timestamp)
//   const tokenUri = await contractAPI.tokenURI(BigNumber.from(token.id.slice(-9)))
//   token.tokenUri = tokenUri
//   if (tokenUri) {
//     let meta = await metadata.get(ctx.store, Metadata, token.tokenUri)
//     if (!meta) {
//       meta = await parseMetadata(ctx, token.tokenUri)
//       if (meta) metadata.save(meta)
//     }
//     token.metadata = meta
//   }
// }

// export async function updateERC1155TokenMetadata(
//   ctx: CommonHandlerContext<Store>,
//   token: ERC1155Token,
//   contractAPI: erc1155.Contract
// ): Promise<void> {
//   token.updatedAt = BigInt(ctx.block.timestamp)
//   const tokenUri = await contractAPI.uri(BigNumber.from(token.id.slice(-9)))
//   token.tokenUri = tokenUri
//   if (tokenUri) {
//     let meta = await metadata.get(ctx.store, Metadata, token.tokenUri)
//     if (!meta) {
//       meta = await parseMetadata(ctx, token.tokenUri)
//       if (meta) metadata.save(meta)
//     }
//     token.metadata = meta
//   }
// }

// export async function updateTokenMetadata(
//   ctx: CommonHandlerContext<Store>,
//   token: Token,
//   contractAPI: raresamaCollection.Contract
// ): Promise<void> {
//   token.updatedAt = BigInt(ctx.block.timestamp)
//   const tokenUri = await contractAPI.tokenURI(BigNumber.from(token.id.slice(-9)))
//   token.tokenUri = tokenUri
//   if (tokenUri) {
//     let metadata = await metadatas.get(ctx.store, Metadata, token.tokenUri)
//     if (!metadata) {
//       metadata = await parseMetadata(ctx, token.tokenUri)
//       if (metadata) metadatas.save(metadata)
//     }
//     token.metadata = metadata
//   }
// }
