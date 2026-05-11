"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseService", {
    enumerable: true,
    get: function() {
        return BaseService;
    }
});
let BaseService = class BaseService {
    async create(data) {
        return this.repository.create(data);
    }
    async findAll(params) {
        return this.repository.findAll(params);
    }
    async findOne(id) {
        return this.repository.findOneOrThrow(id);
    }
    async update(id, data) {
        return this.repository.update(id, data);
    }
    async remove(id) {
        return this.repository.softDelete(id);
    }
    async count(params) {
        return this.repository.count(params);
    }
    constructor(repository){
        this.repository = repository;
    }
};

//# sourceMappingURL=base.service.js.map