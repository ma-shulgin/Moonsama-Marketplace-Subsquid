import { SubstrateEvent } from '@subsquid/substrate-processor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEVMLog = (event: SubstrateEvent) : any => event.args.log ?? event.args


 