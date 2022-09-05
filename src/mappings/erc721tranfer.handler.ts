import { EvmLogHandlerContext } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import assert from 'assert';
import {
	ERC721Contract,
	ERC721Owner,
	ERC721Token,
	ERC721Transfer,
} from '../model';
import * as erc721 from '../abi/erc721';
import {
	ERC721contract,
	ERC721owner,
	ERC721token,
	ERC721transfer,
} from '../utils/entitiesManager';
import {
	getTokenId,
	getOrCreateERC721Owner,
	updateERC721TokenMetadata,
} from '../helpers';
import { NULL_ADDRESS, TOKEN_RELATIONS } from '../utils/config';

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
	let oldOwner = await ERC721owner.get(
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

	let owner = await ERC721owner.get(
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

	if (
		oldOwner.balance != null &&
		oldOwner.balance > BigInt(0) &&
		oldOwner.id != '0x0000000000000000000000000000000000000000'
	) {
		oldOwner.balance = oldOwner.balance - BigInt(1);
	}

	if (owner.balance != null) {
		owner.balance = owner.balance + BigInt(1);
	}

	let contractData = await ERC721contract.get(
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
		});
	} else {
		contractData.name = name;
		contractData.symbol = symbol;
		contractData.totalSupply = totalSupply.toBigInt();
		contractData.contractURI = contractURI;
		contractData.contractURIUpdated = BigInt(block.timestamp);
	}
	const nativeId = data.tokenId.toBigInt();
	const id = getTokenId(contractAddress, nativeId);
	let token = await ERC721token.get(
		ctx.store,
		ERC721Token,
		id,
		TOKEN_RELATIONS
	);

	assert(token);
	if (!token) {
		// check if token is minting
		assert(
			data.from === NULL_ADDRESS,
			`Contract's ${contractAddress} Token ${nativeId} transferred before mint`
		);
		token = new ERC721Token({
			id,
			numericId: nativeId,
			owner,
			tokenUri,
			contract: contractData,
			updatedAt: BigInt(block.timestamp),
			createdAt: BigInt(block.timestamp),
		});
		await updateERC721TokenMetadata(ctx, token, contractAPI);
	} else {
		token.owner = owner;
	}

	let transferId = block.hash
		.concat('-'.concat(data.tokenId.toString()))
		.concat('-'.concat(event.indexInBlock.toString()));
	// let transfer = await ERC721transfer.get(ctx.store, ERC721Transfer, transferId);
	// if (transfer == null) {
	const transfer = new ERC721Transfer({
		id: transferId,
		block: block.height,
		timestamp: BigInt(block.timestamp),
		transactionHash: block.hash,
		from: oldOwner,
		to: owner,
		token,
	});
	// }
	ctx.log.info(`Token - ${token}`)
	await ctx.store.save(oldOwner);
	await ctx.store.save(owner);
	await ctx.store.save(contractData);
	await ctx.store.save(token);
	await ctx.store.save(transfer);
}
