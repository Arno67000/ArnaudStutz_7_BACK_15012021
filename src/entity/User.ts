import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from "typeorm";
import { Tweet } from "./Tweet";

@Entity({ name: "users" })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    pseudo: string;
    @Column()
    lastName: string;
    @Column()
    firstName: string;
    @Column()
    password: string;
    @Column()
    role: string;
    @OneToMany(() => Tweet, (tweet: Tweet) => tweet.user, { onDelete: "CASCADE" })
    tweets: Tweet[];
}
