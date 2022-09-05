// import { EvmLogHandlerContext } from '@subsquid/substrate-processor'
// import { Store } from '@subsquid/typeorm-store'
// import { updateTokenMetadata } from '../helpers'
// import * as raresamaCollection from '../types/generated/raresama-collection'
// import { tokens } from '../utils/entitiesManager'

// export async function handleUriAll(
//   ctx: EvmLogHandlerContext<Store>
// ): Promise<void> {
//   const { event, store } = ctx
//   const evmLog = event.args
//   const address = (<string>evmLog.address).toLowerCase()
//   const contractAPI = new raresamaCollection.Contract(ctx, address)
//   const updatedTokens = await tokens.getAllContractTokens(store, address)

//   for (const token of updatedTokens) {
//     await updateTokenMetadata(ctx, token, contractAPI)
//   }
//   ctx.log.info(`All tokens of the contract updated - ${address}`)

//   updatedTokens.forEach((token) => {
//     tokens.save(token)
//   })
// }
