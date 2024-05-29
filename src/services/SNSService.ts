import { 
    SNSClient,
    PublishCommand
} from "@aws-sdk/client-sns";

import { TOPIC_ARN_TEMPLATE } from "../utils/constants";

export class SNSService {
    private readonly client: SNSClient;

    constructor() {
        this.client = new SNSClient();
    }

    public async publish<TMessage extends Object>(
        topicName: string, 
        message: TMessage
    ): Promise<string | undefined> {
        const command = new PublishCommand({
            TopicArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
            Message: JSON.stringify(message)
        });

        const output = await this.client.send(command);

        return output.MessageId;
    }
}