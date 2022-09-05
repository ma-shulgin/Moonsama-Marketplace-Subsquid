import { Store, TypeormDatabase } from '@subsquid/typeorm-store'
import {
  EvmLogHandlerContext,
  SubstrateBatchProcessor,
} from '@subsquid/substrate-processor'
import { handleContractUri, handleNewContract, handleTransfer, handleUri, handleUriAll } from './mappings'
import { saveAll } from './utils/entitiesManager'
import * as collectionFactory from './types/generated/collection-factory'
import * as raresamaCollection from './types/generated/raresama-collection'
import * as config from './utils/config'
import { isKnownContract } from './helpers'

const database = new TypeormDatabase()
const processor = new SubstrateBatchProcessor()
  .setBatchSize(100)
  .setBlockRange({ from: 2385792 })
  // .setBlockRange({ from: 2395293 })
  .setDataSource({
    chain: config.CHAIN_NODE,
    archive: 'https://moonriver.archive.subsquid.io/graphql',
  })
  .setTypesBundle('moonriver')
  .addEvmLog(config.FACTORY_ADDRESS, {
    filter: [
      collectionFactory.events[
        'CollectionAdded(uint256,bytes32,address,uint256)'
      ].topic,
    ],
  })
  .addEvmLog('*', {
    filter: [
      [
        raresamaCollection.events['Transfer(address,address,uint256)'].topic,
        raresamaCollection.events['URI(uint256)'].topic,
        raresamaCollection.events['URIAll()'].topic,
        raresamaCollection.events['ContractURI()'].topic,
      ],
    ],
  })

processor.run(database, async (ctx) => {
  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind === 'event') {
        if (item.name === 'EVM.Log') {
          await handleEvmLog({
            ...ctx,
            block: block.header,
            event: item.event,
          })
        }
      }
    }
  }
  await saveAll(ctx.store)
})

async function handleEvmLog(ctx: EvmLogHandlerContext<Store>) {
  const contractAddress = ctx.event.args.address
  if (
    contractAddress === config.FACTORY_ADDRESS &&
    ctx.event.args.topics[0] ===
      collectionFactory.events[
        'CollectionAdded(uint256,bytes32,address,uint256)'
      ].topic
  ) {
    await handleNewContract(ctx)
  } else if (
    await isKnownContract(ctx.store, contractAddress, ctx.block.height)
  )
    switch (ctx.event.args.topics[0]) {
      case raresamaCollection.events['Transfer(address,address,uint256)'].topic:
        await handleTransfer(ctx)
        break
      case raresamaCollection.events['URI(uint256)'].topic:
        await handleUri(ctx)
        break
      case raresamaCollection.events['URIAll()'].topic:
        await handleUriAll(ctx)
        break
      case raresamaCollection.events['ContractURI()'].topic:
        await handleContractUri(ctx)
        break
      default:
    }
}
