import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: "tweets" })
export class Tweet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar"})
    content: string;

    @CreateDateColumn({ type: 'datetime'})
    date: Date;

    @ManyToOne((type) => User, (user) => user.tweets)
    user: User;
};