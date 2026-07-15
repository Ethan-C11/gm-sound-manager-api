import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, type Relation} from 'typeorm';
import {Session} from "./session.entity.js";
import {AudioTrack} from "./audioTrack.entity.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    username: string;
    @Column()
    email: string;
    @Column()
    hashedPassword: string;
    @CreateDateColumn()
    createdAt: Date;
    @OneToMany(() => Session, (sessionEntity) => sessionEntity.owner)
    ownedSessions: Relation<Session[]>;
    @ManyToMany(() => Session, (session) => session.sessionMembers)
    joinedSessions: Relation<Session[]>;

    @OneToMany(() => AudioTrack, (audioTrack) => audioTrack.uploadedBy)
    importedSounds: Relation<AudioTrack[]>;
}