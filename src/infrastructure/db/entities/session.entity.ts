import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable, type Relation} from 'typeorm';
import {User} from "./user.entity.js";

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => User, (user) => user.ownedSessions)
    owner: Relation<User>;
    @Column()
    codeOfEvent: string;
    @Column()
    event: string;
    @Column()
    inviteCode: string;
    @CreateDateColumn()
    createdAt: Date;
    @ManyToMany(() => User, (user) => user.joinedSessions)
    @JoinTable()
    sessionMembers: Relation<User[]>;
}