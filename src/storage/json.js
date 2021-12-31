class JSONObject extends Map {
    constructor() {
        super();
    }

    safeget(key, error) {
        if(super.has(key))
            return super.get(key);
        
        if(typeof(error) == "function")
            error();
        else
            throw new RangeError(`The key "${key}" cannot be found!`);
    }
}

class JSONArray extends Array {
    constructor(...arr) {
        super(...arr);
    }

    safeget(index, error) {
        if(index < super.length && index > -1)
            return super.at(index);
        
        if(typeof(error) == "function")
            error();
        else
            throw new RangeError(`Index ${index} is out of bounds!`);
    }

    delete(index) {
        if(index < this.length && index > -1)
            this.splice(index, 1);
    }
}

module.exports = {
    JSONObject: JSONObject,
    JSONArray: JSONArray
};