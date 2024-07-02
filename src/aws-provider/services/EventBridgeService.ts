import { 
    SchedulerClient, 
    CreateScheduleCommand, 
    DeleteScheduleCommand, 
    UpdateScheduleCommand,
    TagResourceCommand
} from "@aws-sdk/client-scheduler";
import { v4 } from "uuid";
import { TOPIC_ARN_TEMPLATE } from "../utils/constants";
import { 
    ScheduleOutput 
} from '../utils/types';
import { GenericMessage, ScheduleInput } from "../../application/utils/types";
import { Configuration } from "../../application/utils/configuration";

export class EventBridgeService extends SchedulerClient {
    public async schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>): Promise<ScheduleOutput> {
        const scheduleName = v4();

        const command = new CreateScheduleCommand({
            Name: scheduleName,
            Description: 'Schedule a message',
            Target: {
                Arn: TOPIC_ARN_TEMPLATE(params.TopicName),
                RoleArn: process.env.AWS_ROLE_ARN,
                Input: JSON.stringify(params.Message)
            },
            FlexibleTimeWindow: {
                Mode: 'OFF'
            },
            ScheduleExpression: `at(${params.ScheduleDate.toISOString()})`,
            ActionAfterCompletion: 'DELETE'
        });

        const output = await this.send(command);

        await this.tag(output.ScheduleArn);

        return {
            Id: scheduleName,
            ScheduleArn: output.ScheduleArn
        }
    }

    private async tag(resourceArn: string | undefined) {
        const command = new TagResourceCommand({
            ResourceArn: resourceArn,
            Tags: Configuration.tags
        });

        await this.send(command);
    }
}