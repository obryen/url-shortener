import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ShortUrlMapping } from './url-shortener.entity';

@Entity({ name: 'shortener_url_events' })
export class ShortUrlEvent {
    constructor(data: Partial<ShortUrlEvent>) {
        if (data) Object.assign(this, data);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'short_url_id', nullable: false })
    shortUrlId: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false, default: 'now()' })
    createdAt: Date;

    @ManyToOne(() => ShortUrlMapping, (entity) => entity.shortUrlEvents)
    @JoinColumn({ name: 'short_url_id', referencedColumnName: 'id' })
    shortUrlMapping: ShortUrlMapping;
}
