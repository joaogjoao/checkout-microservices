import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Shipping } from './shipping.entity';

@Entity('address')
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column()
  country: string;

  @OneToOne(() => Shipping, (shipping) => shipping.address, { onDelete: 'CASCADE' })
  shipping: Shipping;
}
