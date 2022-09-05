// import { EvmLogHandlerContext } from '@subsquid/substrate-processor'
// import { Store } from '@subsquid/typeorm-store'
// import assert from 'assert'
// import { fetchContractMetadata } from '../helpers/metadata.helper'
// import { Contract } from '../model'
// import * as raresamaCollection from '../types/generated/raresama-collection'
// import { contracts } from '../utils/entitiesManager'

// export async function handleContractUri(
//   ctx: EvmLogHandlerContext<Store>
// ): Promise<void> {
//   const { event, block, store } = ctx
//   const evmLog = event.args
//   const address = (<string>evmLog.address).toLowerCase()
//   const contractAPI = new raresamaCollection.Contract(ctx, address)

//   const contractURI = await contractAPI.contractURI()

//   const contract = await contracts.get(
//     store,
//     Contract,
//     address,
//     undefined,
//     true
//   )
//   assert(contract)
//   contract.contractURI = contractURI
//   contract.contractURIUpdated = BigInt(block.timestamp)

//   if (contractURI) {
//     const rawMetadata = await fetchContractMetadata(ctx, contractURI)
//     if (rawMetadata) {
//       contract.metadataName = rawMetadata.name
//       contract.artist = rawMetadata.artist
//       contract.artistUrl = rawMetadata.artistUrl
//       contract.externalLink = rawMetadata.externalLink
//       contract.description = rawMetadata.description
//       contract.image = rawMetadata.image
//     }
//   }

//   ctx.log.info(`Collection URI updated - ${contract.id}`)
//   contracts.save(contract)
// }
