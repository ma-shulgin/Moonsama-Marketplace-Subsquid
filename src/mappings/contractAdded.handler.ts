import { EvmLogHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { fetchContractMetadata } from '../helpers/metadata.helper'
import { Contract } from '../model'
import * as collectionFactory from '../types/generated/collection-factory'
import * as raresamaCollection from '../types/generated/raresama-collection'
import { contracts } from '../utils/entitiesManager'

export async function handleNewContract(
  ctx: EvmLogHandlerContext<Store>
): Promise<void> {
  const { event, block } = ctx
  const evmLog = event.args
  const data =
    collectionFactory.events[
      'CollectionAdded(uint256,bytes32,address,uint256)'
    ].decode(evmLog)
  const address = data.collectionAddress.toLowerCase()

  const contractAPI = new raresamaCollection.Contract(ctx, block, address)

  const [name, symbol, contractURI, decimals] = await Promise.all([
    contractAPI.name(),
    contractAPI.symbol(),
    contractAPI.contractURI(),
    contractAPI.decimals(),
  ])

  const contract = new Contract({
    id: address,
    factoryId: data.id.toBigInt(),
    name,
    symbol,
    totalSupply: 0n,
    contractURI,
    decimals,
    startBlock: data.blockNumber.toNumber(),
    contractURIUpdated: BigInt(block.timestamp),
    uniqueOwnersCount: 0,
  })
  const rawMetadata = await fetchContractMetadata(ctx, contractURI)
  if (rawMetadata) {
    contract.metadataName = rawMetadata.name
    contract.artist = rawMetadata.artist
    contract.artistUrl = rawMetadata.artistUrl
    contract.externalLink = rawMetadata.externalLink
    contract.description = rawMetadata.description
    contract.image = rawMetadata.image
  }

  ctx.log.info(`Collection added - ${contract.id}`)
  contracts.save(contract)
}
