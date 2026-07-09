export class User {
    constructor(id, preferences = {}) {
        this.id = id;
        this.preferences = preferences;
    }
}
