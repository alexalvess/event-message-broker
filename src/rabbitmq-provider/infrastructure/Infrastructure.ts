import { IInfrastructure } from '../../application/iInfrastructure';
import { BindTopicInput } from '../../application/utils/types';

export class Infrastructure implements IInfrastructure {
    public async createQueue(queueName: string): Promise<void> {
        
    }

    public async bindTopic(binder: BindTopicInput): Promise<void> {
        
    }
}