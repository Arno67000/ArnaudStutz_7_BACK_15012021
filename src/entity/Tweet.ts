import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from "typeorm";
import { User } from "./User";

@Entity({ name: "tweets" })
export class Tweet extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({ type: "varchar" })
    content: string;
    @CreateDateColumn({ type: "datetime" })
    date: Date;
    @ManyToOne(() => User, (user: User) => user.tweets, { onDelete: "CASCADE" })
    user: User;
}
