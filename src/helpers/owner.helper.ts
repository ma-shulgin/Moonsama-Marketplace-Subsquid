// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CommonHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Owner, TotalOwnedNft } from '../model'
import { owners } from '../utils/entitiesManager'

export async function getOrCreateOwner(
  ctx: CommonHandlerContext<Store>,
  id: string
): Promise<Owner> {
  let owner = await owners.get(ctx.store, Owner, id)
  if (!owner) {
    owner = new Owner({
      id,
      balance: 0n,
      totalCollectionNfts: [],
    })
  }
  owners.save(owner)
  return owner
}

export function findCollectionStat(
  ownStats: TotalOwnedNft[],
  conctractAddress: string,
  createIfNull: boolean
): TotalOwnedNft {
  const neededStat = ownStats.find(
    (stat) => stat.conctractAddress === conctractAddress
  )
  if (!neededStat) {
    if (createIfNull) {
      const newStat = new TotalOwnedNft({
        conctractAddress,
        amount: 0,
      })
      ownStats.push(newStat)
      return newStat
    }
    throw new Error(`No items for contract ${conctractAddress}`)
  } else return neededStat
}
