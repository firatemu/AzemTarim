"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseRepository", {
    enumerable: true,
    get: function() {
        return BaseRepository;
    }
});
const _common = require("@nestjs/common");
let BaseRepository = class BaseRepository {
    get delegate() {
        return this.prisma.extended[this.modelName];
    }
    async create(data) {
        return this.delegate.create({
            data
        });
    }
    async findAll(params) {
        return this.delegate.findMany(params);
    }
    async findOne(id) {
        return this.delegate.findFirst({
            where: {
                id
            }
        });
    }
    async findOneOrThrow(id) {
        const record = await this.findOne(id);
        if (!record) {
            throw new _common.NotFoundException(`${this.modelName} with ID ${id} not found`);
        }
        return record;
    }
    async update(id, data) {
        try {
            return await this.delegate.update({
                where: {
                    id
                },
                data
            });
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async delete(id) {
        try {
            return await this.delegate.delete({
                where: {
                    id
                }
            });
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async softDelete(id) {
        // Requires model to have deletedAt. 
        // If usage of BaseRepository implies strict soft-delete models, we can assume it exists.
        // Or we use update.
        return this.update(id, {
            deletedAt: new Date()
        });
    }
    async count(params) {
        return this.delegate.count(params);
    }
    handleError(error) {
        if (error.code === 'P2025') {
            throw new _common.NotFoundException('Record not found');
        }
    // Add more Prisma error codes as needed
    }
    constructor(prisma, modelName){
        this.prisma = prisma;
        this.modelName = modelName;
    }
};

//# sourceMappingURL=base.repository.js.map