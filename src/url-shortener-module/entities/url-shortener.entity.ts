import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ShortUrlEvent } from './short-url-events.entity';

@Entity({ name: 'short_url_mapping' })
export class ShortUrlMapping {
    constructor(data: Partial<ShortUrlMapping>) {
        if (data) Object.assign(this, data);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', name: 'original_url', nullable: false })
    originalUrl: string;

    @Column({
        type: 'varchar',
        name: 'short_code',
        nullable: false,
    })
    shortCode: string;

    @Column({
        type: 'varchar',
        name: 'short_url',
        nullable: false,
    })
    shortUrl: string;

    @UpdateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false, default: 'now()', generated: 'identity' })
    createdAt: Date;
    @OneToMany(() => ShortUrlEvent, (entity) => entity.shortUrlMapping, {
        cascade: ['insert', 'update'],
    })
    shortUrlEvents: ShortUrlEvent[];
}
