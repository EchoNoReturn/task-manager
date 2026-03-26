import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { UserRole } from "@taskmanager/shared";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, name: "password_hash" })
  passwordHash: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ type: "varchar", length: 100 })
  nickname: string;

  @Column({ type: "varchar", length: 500, nullable: true, name: "avatar_url" })
  avatarUrl: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;
}
