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
    ScheduleInput, 
    ScheduleOutput 
} from '../utils/types';
import { Configuration } from "../utils/Configuration";

export class EventBridgeService extends SchedulerClient {
    public async schedule<TMessage extends Object>(params: ScheduleInput<TMessage>): Promise<ScheduleOutput> {
        const scheduleName = v4();

        const command = new CreateScheduleCommand({
            Name: scheduleName,
            Description: 'Schedule a message',
            Target: {
                Arn: TOPIC_ARN_TEMPLATE.replace('[topicName]', params.TopicName),
                RoleArn: process.env.AWS_ROLE_ARN,
                Input: JSON.stringify(params.Message)
            },
            FlexibleTimeWindow: {
                Mode: 'OFF'
            },
            ScheduleExpression: `at(${params.ScheduleDate.toISOString()})`
        });

        const output = await this.send(command);

        await this.tag(output.ScheduleArn);

        return {
            Id: scheduleName,
            ScheduleArn: output.ScheduleArn
        }
    }

    public async update<TMessage extends Object>(name: string, params: ScheduleInput<TMessage>): Promise<ScheduleOutput> {
        const command = new UpdateScheduleCommand({
            Name: name,
            Description: "Schedule a message",
            ScheduleExpression: `at(${params.ScheduleDate})`,
            Target: {
                Arn: TOPIC_ARN_TEMPLATE.replace('[topicName]', params.TopicName),
                RoleArn: process.env.AWS_ROLE_ARN,
                Input: JSON.stringify(params.Message),
            },
            FlexibleTimeWindow: {
                Mode: "OFF",
            }
        });

        const output = await this.send(command);

        return {
            Id: name,
            ScheduleArn: output.ScheduleArn
        };
    }

    public async delete(name: string) {
        const command = new DeleteScheduleCommand({ Name: name });
        await this.send(command);
    }

    private async tag(resourceArn: string | undefined) {
        const command = new TagResourceCommand({
            ResourceArn: resourceArn,
            Tags: Configuration.tags
        });

        await this.send(command);
    }
}