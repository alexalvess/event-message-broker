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
    private static _prefetch: number = 10;

    public static pushTags(tags: TagsResourceInput) {
        this._tags.concat(tags);
    }

    public static configurePrefetch(prefetch: number) {
        this._prefetch = prefetch;
    }

    public static get tags() {
        return this._tags;
    }

    public static get prefetch() {
        return this._prefetch;
    }
}