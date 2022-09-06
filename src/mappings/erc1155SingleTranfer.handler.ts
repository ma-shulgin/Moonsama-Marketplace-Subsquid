// import { EvmLogHandlerContext } from '@subsquid/substrate-processor';
// import { Store } from '@subsquid/typeorm-store';
// import assert from 'assert';
// import {
// 	ERC1155Contract,
// 	ERC1155Owner,
// 	ERC1155Token,
// 	ERC1155TokenOwner,
// 	ERC1155Transfer,
// 	Metadata,
// } from '../model';
// import * as erc1155 from '../abi/erc1155';
// import {
// 	ERC1155contract,
// 	ERC1155owner,
// 	ERC1155token,
// 	ERC1155tokenOwner,
// 	ERC1155transfer,
// 	metadata,
// } from '../utils/entitiesManager';
// import { parseMetadata } from '../helpers/metadata.helper';
// import { TOKEN_RELATIONS } from '../utils/config';

// export async function erc1155handleSingleTransfer(
// 	ctx: EvmLogHandlerContext<Store>
// ): Promise<void> {
// 	const { event, block, store } = ctx;
// 	const evmLog = event.args;
// 	const contractAddress = evmLog.address.toLowerCase() as string;
// 	const contractAPI = new erc1155.Contract(ctx, contractAddress);
// 	const data =
// 		erc1155.events['Transfer(address,address,uint256)'].decode(evmLog);
// 	const [name, symbol, contractURI, totalSupply, tokenUri] =
// 		await Promise.all([
// 			contractAPI.name(),
// 			contractAPI.symbol(),
// 			contractAPI.contractURI(),
// 			contractAPI.totalSupply(),
// 			contractAPI.tokenURI(data.tokenId),
// 		]);
// 	let oldOwner = await ERC1155owner.get(
// 		ctx.store,
// 		ERC1155Owner,
// 		data.from.toLowerCase()
// 	);
// 	if (oldOwner == null) {
// 		oldOwner = new ERC1155Owner({
// 			id: data.from.toLowerCase(),
// 			balance: 0n,
// 		});
// 	}

// 	let owner = await ERC1155owner.get(
// 		ctx.store,
// 		ERC1155Owner,
// 		data.to.toLowerCase()
// 	);
// 	if (owner == null) {
// 		owner = new ERC1155Owner({
// 			id: data.to.toLowerCase(),
// 			balance: 0n,
// 		});
// 	}

// 	if (
// 		oldOwner.balance != null &&
// 		oldOwner.balance > BigInt(0) &&
// 		oldOwner.id != '0x0000000000000000000000000000000000000000'
// 	) {
// 		oldOwner.balance = oldOwner.balance - BigInt(1);
// 	}

// 	if (owner.balance != null) {
// 		owner.balance = owner.balance + BigInt(1);
// 	}

// 	ERC1155owner.save(oldOwner);
// 	ERC1155owner.save(owner);

// 	let contractData = await ERC1155contract.get(
// 		ctx.store,
// 		ERC1155Contract,
// 		contractAddress
// 	);
// 	if (contractData == null) {
// 		contractData = new ERC1155Contract({
// 			id: contractAddress,
// 			address: contractAddress,
// 			name: name,
// 			symbol: symbol,
// 			totalSupply: totalSupply.toBigInt(),
// 			decimals: 0,
// 			contractURI: contractURI,
// 			contractURIUpdated: BigInt(block.timestamp),
// 		});
// 	} else {
// 		contractData.name = name;
// 		contractData.symbol = symbol;
// 		contractData.totalSupply = totalSupply.toBigInt();
// 		contractData.contractURI = contractURI;
// 		contractData.contractURIUpdated = BigInt(block.timestamp);
// 	}
// 	ERC1155contract.save(contractData);

// 	let metadatId = contractAddress + '-' + data.tokenId.toString();
// 	let meta = await metadata.get(ctx.store, Metadata, metadatId);
// 	if (!meta) {
// 		meta = await parseMetadata(ctx, tokenUri, metadatId);
// 		if (meta) metadata.save(meta);
// 	}

// 	let token = await ERC1155token.get(
// 		ctx.store,
// 		ERC1155Token,
// 		metadatId,
// 		TOKEN_RELATIONS
// 	);
// 	// assert(token);
// 	if (!token) {
// 		token = new ERC1155Token({
// 			id: metadatId,
// 			numericId: data.tokenId.toBigInt(),
// 			owner,
// 			tokenUri,
// 			metadata: meta,
// 			contract: contractData,
// 			updatedAt: BigInt(block.timestamp),
// 			createdAt: BigInt(block.timestamp),
// 		});
// 	} else {
// 		token.owner = owner;
// 	}
// 	ERC1155token.save(token);

// 	let transferId = block.hash
// 		.concat('-'.concat(data.tokenId.toString()))
// 		.concat('-'.concat(event.indexInBlock.toString()));
// 	let transfer = await ERC1155transfer.get(
// 		ctx.store,
// 		ERC1155Transfer,
// 		transferId
// 	);
// 	if (!transfer) {
// 		transfer = new ERC1155Transfer({
// 			id: transferId,
// 			block: block.height,
// 			timestamp: BigInt(block.timestamp),
// 			transactionHash: block.hash,
// 			from: oldOwner,
// 			to: owner,
// 			token,
// 		});
// 	}
// 	ERC1155transfer.save(transfer);
// 	console.log('ERC1155Transfer', transfer);
// }
