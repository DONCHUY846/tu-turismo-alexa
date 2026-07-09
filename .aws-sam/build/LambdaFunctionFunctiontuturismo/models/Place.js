export class Place {
    constructor({ id, name, description, category = 'turismo' }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
    }
}
