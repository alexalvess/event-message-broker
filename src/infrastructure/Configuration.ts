import { TagsResourceInput } from '../utils/types';

export class Configuration {
    private static _tags: TagsResourceInput;

    public static pushTags(tags: TagsResourceInput) {
        this._tags.concat(tags);
    }

    public static get tags() {
        return this._tags;
    }
}