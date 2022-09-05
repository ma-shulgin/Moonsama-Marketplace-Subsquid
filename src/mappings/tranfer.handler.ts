import { EvmLogHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import { Contract, Direction, OwnerTransfer, Token, Transfer } from '../model'
import * as raresamaCollection from '../types/generated/raresama-collection'
import {
  contracts,
  ownerTransfers,
  tokens,
  transfers,
} from '../utils/entitiesManager'
import {
  getTokenId,
  getOrCreateOwner,
  findCollectionStat,
  updateTokenMetadata,
} from '../helpers'
import { NULL_ADDRESS, TOKEN_RELATIONS } from '../utils/config'

export async function handleTransfer(
  ctx: EvmLogHandlerContext<Store>
): Promise<void> {
  const { event, block } = ctx
  const evmLog = event.args
  const address = evmLog.address.toLowerCase() as string
  const contractAPI = new raresamaCollection.Contract(ctx, address)
  const contractEntity = (await contracts.get(
    ctx.store,
    Contract,
    address,
    undefined,
    true
  )) as Contract
  const data =
    raresamaCollection.events['Transfer(address,address,uint256)'].decode(
      evmLog
    )
  const oldOwner =
    data.from === NULL_ADDRESS
      ? null
      : await getOrCreateOwner(ctx, data.from.toLowerCase())
  const owner =
    data.to === NULL_ADDRESS
      ? null
      : await getOrCreateOwner(ctx, data.to.toLowerCase())
  const nativeId = data.tokenId.toBigInt()
  const id = getTokenId(address, nativeId)

  let token = await tokens.get(ctx.store, Token, id, TOKEN_RELATIONS)
  if (!token) {
    // check if token is minting
    assert(
      data.from === NULL_ADDRESS,
      `Contract's ${address} Token ${nativeId} transferred before mint`
    )

    const [tokenUri, compositeTokenUri] = await Promise.all([
      contractAPI.tokenURI(data.tokenId),
      contractAPI.compositeURI(data.tokenId),
    ])

    token = new Token({
      id,
      numericId: nativeId,
      owner,
      tokenUri,
      compositeTokenUri,
      contract: contractEntity,
      updatedAt: BigInt(block.timestamp),
      createdAt: BigInt(block.timestamp),
    })
    // Parse meta if possible
    await updateTokenMetadata(ctx, token, contractAPI)

    contractEntity.totalSupply += 1n
  } else {
    // Update old owner stats (only if not minting)
    if (oldOwner) {
      const collsStats = oldOwner.totalCollectionNfts
      const collStat = findCollectionStat(collsStats, address, false)
      collStat.amount -= 1
      if (!collStat.amount) {
        // Remove from the array
        contractEntity.uniqueOwnersCount -= 1
        collsStats.splice(collsStats.indexOf(collStat), 1)
      }
    }
    // Token is burned
    token.owner = owner
    if (!owner) contractEntity.totalSupply -= 1n
  }
  // Update current owner stats if not burning
  if (owner) {
    const collsStats = owner.totalCollectionNfts
    const collStat = findCollectionStat(collsStats, address, true)
    collStat.amount += 1
    if (collStat.amount === 1) contractEntity.uniqueOwnersCount += 1
  }
  contracts.save(contractEntity)
  tokens.save(token)

  const transfer = new Transfer({
    id: event.id,
    token,
    from: oldOwner,
    to: owner,
    timestamp: BigInt(block.timestamp),
    block: block.height,
    transactionHash: event.evmTxHash,
  })

  transfers.save(transfer)

  const ownerTransfer = new OwnerTransfer({
    id: `${event.id}-to`,
    owner,
    transfer,
    direction: Direction.TO,
  })

  ownerTransfers.save(ownerTransfer)

  const oldOwnerTransfer = new OwnerTransfer({
    id: `${event.id}-from`,
    owner: oldOwner,
    transfer,
    direction: Direction.FROM,
  })

  ownerTransfers.save(oldOwnerTransfer)

  ctx.log.info(`Transfer of token ${id} processed`)
}
