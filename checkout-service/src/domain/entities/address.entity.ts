import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Checkout } from './checkout.entity';

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

  @OneToOne(() => Checkout, (checkout) => checkout.address)
  checkout: Checkout;
}
