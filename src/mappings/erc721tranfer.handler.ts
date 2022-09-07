import { EvmLogHandlerContext } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import assert from 'assert';
import {
	ERC721Contract,
	ERC721Owner,
	ERC721Token,
	ERC721Transfer,
	Metadata,
} from '../model';
import * as erc721 from '../abi/erc721';
import {
	ERC721contracts,
	ERC721owners,
	ERC721tokens,
	ERC721transfers,
	metadatas,
} from '../utils/entitiesManager';
import { parseMetadata, fetchContractMetadata } from '../helpers/metadata.helper'
import { ERC721TOKEN_RELATIONS } from '../utils/config';

export async function erc721handleTransfer(
	ctx: EvmLogHandlerContext<Store>
): Promise<void> {
	const { event, block, store } = ctx;
	const evmLog = event.args;
	const contractAddress = evmLog.address.toLowerCase() as string;
	const contractAPI = new erc721.Contract(ctx, contractAddress);
	const data =
		erc721.events['Transfer(address,address,uint256)'].decode(evmLog);
	const [name, symbol, contractURI, totalSupply, tokenUri] =
		await Promise.all([
			contractAPI.name(),
			contractAPI.symbol(),
			contractAPI.contractURI(),
			contractAPI.totalSupply(),
			contractAPI.tokenURI(data.tokenId),
		]);
	let oldOwner = await ERC721owners.get(
		ctx.store,
		ERC721Owner,
		data.from.toLowerCase()
	);
	if (oldOwner == null) {
		oldOwner = new ERC721Owner({
			id: data.from.toLowerCase(),
			balance: 0n,
		});
	}
	if (
		oldOwner.balance != null &&
		oldOwner.balance > BigInt(0) &&
		oldOwner.id != '0x0000000000000000000000000000000000000000'
	) {
		oldOwner.balance = oldOwner.balance - BigInt(1);
	}
	ERC721owners.save(oldOwner);

	let owner = await ERC721owners.get(
		ctx.store,
		ERC721Owner,
		data.to.toLowerCase()
	);
	if (owner == null) {
		owner = new ERC721Owner({
			id: data.to.toLowerCase(),
			balance: 0n,
		});
	}
	if (owner.balance != null) {
		owner.balance = owner.balance + BigInt(1);
	}
	ERC721owners.save(owner);

	let contractData = await ERC721contracts.get(
		ctx.store,
		ERC721Contract,
		contractAddress
	);
	if (contractData == null) {
		contractData = new ERC721Contract({
			id: contractAddress,
			address: contractAddress,
			name: name,
			symbol: symbol,
			totalSupply: totalSupply.toBigInt(),
			decimals: 0,
			contractURI: contractURI,
			contractURIUpdated: BigInt(block.timestamp),
			startBlock: block.height,
		});
	} else {
		contractData.name = name;
		contractData.symbol = symbol;
		contractData.totalSupply = totalSupply.toBigInt();
		contractData.contractURI = contractURI;
		contractData.contractURIUpdated = BigInt(block.timestamp);
	}
	const rawMetadata = await fetchContractMetadata(ctx, contractURI);
	if (rawMetadata) {
		contractData.metadataName = rawMetadata.name;
		contractData.artist = rawMetadata.artist;
		contractData.artistUrl = rawMetadata.artistUrl;
		contractData.externalLink = rawMetadata.externalLink;
		contractData.description = rawMetadata.description;
		contractData.image = rawMetadata.image;
	}
	ERC721contracts.save(contractData);

	let metadatId = contractAddress + '-' + data.tokenId.toString();
	let metadata = await metadatas.get(ctx.store, Metadata, tokenUri)
    if (!metadata) {
      metadata = await parseMetadata(ctx, tokenUri, metadatId)
      if (metadata) metadatas.save(metadata)
    }

	let token = await ERC721tokens.get(
		ctx.store,
		ERC721Token,
		metadatId,
		ERC721TOKEN_RELATIONS
	);
	// assert(token);
	if (!token) {
		token = new ERC721Token({
			id: metadatId,
			numericId: data.tokenId.toBigInt(),
			owner,
			tokenUri,
			metadata,
			contract: contractData,
			updatedAt: BigInt(block.timestamp),
			createdAt: BigInt(block.timestamp),
		});
	} else {
		token.owner = owner;
		token.updatedAt = BigInt(block.timestamp);
	}
	ERC721tokens.save(token);

	let transferId = block.hash
		.concat('-'.concat(data.tokenId.toString()))
		.concat('-'.concat(event.indexInBlock.toString()));
	let transfer = await ERC721transfers.get(
		ctx.store,
		ERC721Transfer,
		transferId
	);
	if (!transfer) {
		transfer = new ERC721Transfer({
			id: transferId,
			block: block.height,
			timestamp: BigInt(block.timestamp),
			transactionHash: block.hash,
			from: oldOwner,
			to: owner,
			token,
		});
	}
	ERC721transfers.save(transfer);
	console.log('ERC721Transfer', transfer);
}
