import * as ethers from "ethers";
import assert from "assert";

export const abi = new ethers.utils.Interface(getJsonAbi());

export interface CollectionAdded0Event {
  id: ethers.BigNumber;
  template: string;
  collectionAddress: string;
  blockNumber: ethers.BigNumber;
}

export interface RoleAdminChanged0Event {
  role: string;
  previousAdminRole: string;
  newAdminRole: string;
}

export interface RoleGranted0Event {
  role: string;
  account: string;
  sender: string;
}

export interface RoleRevoked0Event {
  role: string;
  account: string;
  sender: string;
}

export interface TemplateRegistrySet0Event {
  newTemplateRegistry: string;
}

export interface EvmEvent {
  data: string;
  topics: string[];
}

export const events = {
  "CollectionAdded(uint256,bytes32,address,uint256)":  {
    topic: abi.getEventTopic("CollectionAdded(uint256,bytes32,address,uint256)"),
    decode(data: EvmEvent): CollectionAdded0Event {
      const result = abi.decodeEventLog(
        abi.getEvent("CollectionAdded(uint256,bytes32,address,uint256)"),
        data.data || "",
        data.topics
      );
      return  {
        id: result[0],
        template: result[1],
        collectionAddress: result[2],
        blockNumber: result[3],
      }
    }
  }
  ,
  "RoleAdminChanged(bytes32,bytes32,bytes32)":  {
    topic: abi.getEventTopic("RoleAdminChanged(bytes32,bytes32,bytes32)"),
    decode(data: EvmEvent): RoleAdminChanged0Event {
      const result = abi.decodeEventLog(
        abi.getEvent("RoleAdminChanged(bytes32,bytes32,bytes32)"),
        data.data || "",
        data.topics
      );
      return  {
        role: result[0],
        previousAdminRole: result[1],
        newAdminRole: result[2],
      }
    }
  }
  ,
  "RoleGranted(bytes32,address,address)":  {
    topic: abi.getEventTopic("RoleGranted(bytes32,address,address)"),
    decode(data: EvmEvent): RoleGranted0Event {
      const result = abi.decodeEventLog(
        abi.getEvent("RoleGranted(bytes32,address,address)"),
        data.data || "",
        data.topics
      );
      return  {
        role: result[0],
        account: result[1],
        sender: result[2],
      }
    }
  }
  ,
  "RoleRevoked(bytes32,address,address)":  {
    topic: abi.getEventTopic("RoleRevoked(bytes32,address,address)"),
    decode(data: EvmEvent): RoleRevoked0Event {
      const result = abi.decodeEventLog(
        abi.getEvent("RoleRevoked(bytes32,address,address)"),
        data.data || "",
        data.topics
      );
      return  {
        role: result[0],
        account: result[1],
        sender: result[2],
      }
    }
  }
  ,
  "TemplateRegistrySet(address)":  {
    topic: abi.getEventTopic("TemplateRegistrySet(address)"),
    decode(data: EvmEvent): TemplateRegistrySet0Event {
      const result = abi.decodeEventLog(
        abi.getEvent("TemplateRegistrySet(address)"),
        data.data || "",
        data.topics
      );
      return  {
        newTemplateRegistry: result[0],
      }
    }
  }
  ,
}

interface ChainContext  {
  _chain: Chain
}

interface BlockContext  {
  _chain: Chain
  block: Block
}

interface Block  {
  height: number
}

interface Chain  {
  client:  {
    call: <T=any>(method: string, params?: unknown[]) => Promise<T>
  }
}

export class Contract  {
  private readonly _chain: Chain
  private readonly blockHeight: number
  readonly address: string

  constructor(ctx: BlockContext, address: string)
  constructor(ctx: ChainContext, block: Block, address: string)
  constructor(ctx: BlockContext, blockOrAddress: Block | string, address?: string) {
    this._chain = ctx._chain
    if (typeof blockOrAddress === 'string')  {
      this.blockHeight = ctx.block.height
      this.address = ethers.utils.getAddress(blockOrAddress)
    }
    else  {
      assert(address != null)
      this.blockHeight = blockOrAddress.height
      this.address = ethers.utils.getAddress(address)
    }
  }

  private async call(name: string, args: any[]) : Promise<ReadonlyArray<any>> {
    const fragment = abi.getFunction(name)
    const data = abi.encodeFunctionData(fragment, args)
    const result = await this._chain.client.call('eth_call', [{to: this.address, data}, this.blockHeight])
    return abi.decodeFunctionResult(fragment, result)
  }

  async DEFAULT_ADMIN_ROLE(): Promise<string> {
    const result = await this.call("DEFAULT_ADMIN_ROLE", [])
    return result[0]
  }

  async GOVERNANCE_ROLE(): Promise<string> {
    const result = await this.call("GOVERNANCE_ROLE", [])
    return result[0]
  }

  async OPERATOR_ROLE(): Promise<string> {
    const result = await this.call("OPERATOR_ROLE", [])
    return result[0]
  }

  async TEMPLATE_TAG_ERC1155(): Promise<string> {
    const result = await this.call("TEMPLATE_TAG_ERC1155", [])
    return result[0]
  }

  async TEMPLATE_TAG_ERC721(): Promise<string> {
    const result = await this.call("TEMPLATE_TAG_ERC721", [])
    return result[0]
  }

  async VERSION(): Promise<ethers.BigNumber> {
    const result = await this.call("VERSION", [])
    return result[0]
  }

  async exists(_id: ethers.BigNumber): Promise<boolean> {
    const result = await this.call("exists", [_id])
    return result[0]
  }

  async getCollection(_id: ethers.BigNumber): Promise<string> {
    const result = await this.call("getCollection", [_id])
    return result[0]
  }

  async getCollections(): Promise<Array<string>> {
    const result = await this.call("getCollections", [])
    return result[0]
  }

  async getLastCollection(): Promise<string> {
    const result = await this.call("getLastCollection", [])
    return result[0]
  }

  async getLastCollectionId(): Promise<ethers.BigNumber> {
    const result = await this.call("getLastCollectionId", [])
    return result[0]
  }

  async getRoleAdmin(role: string): Promise<string> {
    const result = await this.call("getRoleAdmin", [role])
    return result[0]
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    const result = await this.call("hasRole", [role, account])
    return result[0]
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    const result = await this.call("supportsInterface", [interfaceId])
    return result[0]
  }

  async templateRegistry(): Promise<string> {
    const result = await this.call("templateRegistry", [])
    return result[0]
  }

  async totalSupply(): Promise<ethers.BigNumber> {
    const result = await this.call("totalSupply", [])
    return result[0]
  }
}

function getJsonAbi(): any {
  return [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_templateRegistry",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "governor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "template",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "collectionAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "name": "CollectionAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "newTemplateRegistry",
          "type": "address"
        }
      ],
      "name": "TemplateRegistrySet",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "GOVERNANCE_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "OPERATOR_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "TEMPLATE_TAG_ERC1155",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "TEMPLATE_TAG_ERC721",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_templateTag",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_collection",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_indexFromBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "addManual",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes[]",
          "name": "calls",
          "type": "bytes[]"
        },
        {
          "internalType": "bool",
          "name": "revertOnFail",
          "type": "bool"
        }
      ],
      "name": "batch",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_templateTag",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "admin",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "_decimals",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_contractURI",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_defaultTokenURI",
          "type": "string"
        }
      ],
      "name": "create",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_templateTag",
          "type": "bytes32"
        }
      ],
      "name": "createNonInit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "exists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getCollection",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCollections",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastCollection",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastCollectionId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_templateRegistry",
          "type": "address"
        }
      ],
      "name": "setTemplateRegistry",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "templateRegistry",
      "outputs": [
        {
          "internalType": "contract TemplateRegistry",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}
