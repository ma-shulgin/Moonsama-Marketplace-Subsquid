import { EvmLogHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import {
  ERC1155Contract,
  ERC1155Owner,
  ERC1155Token,
  ERC1155TokenOwner,
  ERC1155Transfer,
} from '../model'
import * as erc1155 from '../abi/erc1155'
import {
  ERC1155contracts,
  ERC1155owners,
  ERC1155tokens,
  ERC1155tokenOwners,
  ERC1155transfers,
} from '../utils/entitiesManager'
import { ERC1155TOKEN_RELATIONS, NULL_ADDRESS } from '../utils/config'
import { getEVMLog, getTokenId } from '../helpers'

export async function erc1155handleMultiTransfer(
  ctx: EvmLogHandlerContext<Store>
): Promise<void> {
  const { event, block } = ctx
  const evmLog = getEVMLog(event)
  const contractAddress = evmLog.address.toLowerCase() as string
  const contractAPI = new erc1155.Contract(ctx, contractAddress)
  // const contractAPI = new ethers.Contract(
  //   contractAddress,
  //   erc1155.abi,
  //   provider
  // )

  const data =
    erc1155.events[
      'TransferBatch(address,address,address,uint256[],uint256[])'
    ].decode(evmLog)

  let oldOwner = await ERC1155owners.get(
    ctx.store,
    ERC1155Owner,
    data.from.toLowerCase()
  )
  if (!oldOwner) {
    oldOwner = new ERC1155Owner({
      id: data.from.toLowerCase(),
    })
    ERC1155owners.save(oldOwner)
  }

  let owner = await ERC1155owners.get(
    ctx.store,
    ERC1155Owner,
    data.to.toLowerCase()
  )
  if (!owner) {
    owner = new ERC1155Owner({
      id: data.to.toLowerCase(),
    })
    ERC1155owners.save(owner)
  }

  let contractData = await ERC1155contracts.get(
    ctx.store,
    ERC1155Contract,
    contractAddress
  )

  if (!contractData) {
    if (oldOwner.id === NULL_ADDRESS) {
      const [name, symbol, decimals] = await Promise.all([
        contractAPI.name(),
        contractAPI.symbol(),
        contractAPI.decimals(),
      ])
      contractData = new ERC1155Contract({
        id: contractAddress,
        address: contractAddress,
        name,
        symbol,
        decimals,
        startBlock: block.height,
        contractURIUpdated: BigInt(block.timestamp) / BigInt(1000),
      })
    } else throw new Error(`Can't find contract entity for ${contractAddress}`)
  }
  ERC1155contracts.save(contractData)

  for (let i = 0; i < data.ids.length; i++) {
    // const contractTotalSupply =
    //   BigInt(data.ids[i].toBigInt()) > contractData.totalSupply
    //     ? BigInt(data.ids[i].toString())
    //     : contractData.totalSupply

    // contractData.totalSupply = contractTotalSupply

    const numericId = data.ids[i].toBigInt()
    const tokenId = getTokenId(contractAddress, numericId)

    let token = await ERC1155tokens.get(
      ctx.store,
      ERC1155Token,
      tokenId,
      ERC1155TOKEN_RELATIONS
    )
    if (!token) {
      if (oldOwner.id === NULL_ADDRESS)
        token = new ERC1155Token({
          id: tokenId,
          numericId,
          contract: contractData,
          updatedAt: BigInt(block.timestamp) / BigInt(1000),
          createdAt: BigInt(block.timestamp) / BigInt(1000),
        })
      else throw new Error(`Can't find token entity for ${tokenId}`)
    }
    ERC1155tokens.save(token)

    const senderTokenOwnerId = oldOwner.id.concat('-').concat(tokenId)
    let senderTokenOwner = await ERC1155tokenOwners.get(
      ctx.store,
      ERC1155TokenOwner,
      senderTokenOwnerId
    )
    if (!senderTokenOwner) {
      senderTokenOwner = new ERC1155TokenOwner({
        id: senderTokenOwnerId,
        balance: 0n,
        token,
        owner: oldOwner,
      })
    }
    // if we mint tokens, we don't mark it
    // total minted ever can be caluclated by totalSupply + burned amount
    if (oldOwner.id !== NULL_ADDRESS) {
      senderTokenOwner.balance -= data[4][i].toBigInt()
    }
    ERC1155tokenOwners.save(senderTokenOwner)

    const recipientTokenOwnerId = owner.id.concat('-').concat(tokenId)
    let recipientTokenOwner = await ERC1155tokenOwners.get(
      ctx.store,
      ERC1155TokenOwner,
      recipientTokenOwnerId
    )
    if (!recipientTokenOwner) {
      recipientTokenOwner = new ERC1155TokenOwner({
        id: recipientTokenOwnerId,
        balance: 0n,
        token,
        owner,
      })
    }

    // in case of 0x0000000000000000000000000000000000000000 it's the burned amount
    recipientTokenOwner.balance += data[4][i].toBigInt()

    ERC1155tokenOwners.save(recipientTokenOwner)

    const transferId = event.evmTxHash
      .concat('-'.concat(tokenId))
      .concat('-'.concat(event.indexInBlock.toString()))
      .concat('-')
      .concat(i.toString())
    const transfer = new ERC1155Transfer({
      id: transferId,
      block: BigInt(block.height),
      timestamp: BigInt(block.timestamp) / BigInt(1000),
      transactionHash: event.evmTxHash,
      from: oldOwner,
      to: owner,
      token,
      value: data[4][i].toBigInt(),
    })
    ERC1155transfers.save(transfer)
    ctx.log.info(`[ERC1155Transfer] - ${tokenId} - ${transfer.id}`)
  }
}
