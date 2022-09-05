import assert from "assert"
import * as marshal from "./marshal"

export class TotalOwnedNft {
  private _conctractAddress!: string
  private _amount!: number

  constructor(props?: Partial<Omit<TotalOwnedNft, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._conctractAddress = marshal.string.fromJSON(json.conctractAddress)
      this._amount = marshal.int.fromJSON(json.amount)
    }
  }

  get conctractAddress(): string {
    assert(this._conctractAddress != null, 'uninitialized access')
    return this._conctractAddress
  }

  set conctractAddress(value: string) {
    this._conctractAddress = value
  }

  get amount(): number {
    assert(this._amount != null, 'uninitialized access')
    return this._amount
  }

  set amount(value: number) {
    this._amount = value
  }

  toJSON(): object {
    return {
      conctractAddress: this.conctractAddress,
      amount: this.amount,
    }
  }
}
