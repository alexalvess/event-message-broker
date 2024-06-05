import { TagsResourceInput } from './types';

export class Configuration {
    private static _tags: TagsResourceInput = [
        {
            Key: 'stack',
            Value: 'nodeJS'
        },
        {
            Key: 'strategy',
            Value: 'message-bus'
        }
    ];

    public static pushTags(tags: TagsResourceInput) {
        this._tags.concat(tags);
    }

    public static get tags() {
        return this._tags;
    }
}