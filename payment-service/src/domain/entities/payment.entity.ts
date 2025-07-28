import { PaymentMethod } from 'src/domain/enums/payment-method.enum';
import { PaymentStatus } from 'src/domain/enums/payment-status.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  checkoutId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CREDIT_CARD })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn( { type: 'timestamp' , default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
