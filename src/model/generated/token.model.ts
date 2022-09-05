import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Owner} from "./owner.model"
import {Transfer} from "./transfer.model"
import {Contract} from "./contract.model"
import {Metadata} from "./metadata.model"

@Entity_()
export class Token {
  constructor(props?: Partial<Token>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  numericId!: bigint

  @Index_()
  @ManyToOne_(() => Owner, {nullable: true})
  owner!: Owner | undefined | null

  @Column_("text", {nullable: true})
  tokenUri!: string | undefined | null

  @Column_("text", {nullable: true})
  compositeTokenUri!: string | undefined | null

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  updatedAt!: bigint

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  createdAt!: bigint

  @OneToMany_(() => Transfer, e => e.token)
  transfers!: Transfer[]

  @Index_()
  @ManyToOne_(() => Contract, {nullable: true})
  contract!: Contract

  @Index_()
  @ManyToOne_(() => Metadata, {nullable: true})
  metadata!: Metadata | undefined | null
}
