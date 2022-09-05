import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Owner} from "./owner.model"
import {Transfer} from "./transfer.model"
import {Direction} from "./_direction"

@Entity_()
export class OwnerTransfer {
  constructor(props?: Partial<OwnerTransfer>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Owner, {nullable: true})
  owner!: Owner | undefined | null

  @Index_()
  @ManyToOne_(() => Transfer, {nullable: true})
  transfer!: Transfer

  @Column_("varchar", {length: 4, nullable: false})
  direction!: Direction
}
