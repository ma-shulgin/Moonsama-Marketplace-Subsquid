import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./token.model"
import {TotalOwnedNft} from "./_totalOwnedNft"
import {OwnerTransfer} from "./ownerTransfer.model"

@Entity_()
export class Owner {
  constructor(props?: Partial<Owner>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @OneToMany_(() => Token, e => e.owner)
  ownedTokens!: Token[]

  @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val.toJSON()), from: obj => marshal.fromList(obj, val => new TotalOwnedNft(undefined, marshal.nonNull(val)))}, nullable: false})
  totalCollectionNfts!: (TotalOwnedNft)[]

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint

  @OneToMany_(() => OwnerTransfer, e => e.owner)
  transfers!: OwnerTransfer[]
}
