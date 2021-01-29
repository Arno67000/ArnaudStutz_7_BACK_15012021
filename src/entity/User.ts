import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tweet } from './Tweet';

@Entity({ name: "users"})
export class User {
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

    @OneToMany((type) => Tweet, (tweet) => tweet.user)
    tweets: Tweet[];
};