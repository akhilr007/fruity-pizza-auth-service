import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from './User';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
