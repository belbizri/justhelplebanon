/**
 * Base Repository Class
 * Provides common CRUD operations for MongoDB models
 * Extend this class for entity-specific repositories
 */

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Create operation failed: ${error.message}`);
    }
  }

  /**
   * Find document by ID
   */
  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`FindById operation failed: ${error.message}`);
    }
  }

  /**
   * Find documents with query
   */
  async find(query = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { _id: -1 } } = options;
      return await this.model
        .find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .exec();
    } catch (error) {
      throw new Error(`Find operation failed: ${error.message}`);
    }
  }

  /**
   * Find one document
   */
  async findOne(query = {}) {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      throw new Error(`FindOne operation failed: ${error.message}`);
    }
  }

  /**
   * Update document by ID
   */
  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new Error(`UpdateById operation failed: ${error.message}`);
    }
  }

  /**
   * Update documents matching query
   */
  async updateMany(query, data) {
    try {
      return await this.model.updateMany(query, data, { runValidators: true });
    } catch (error) {
      throw new Error(`UpdateMany operation failed: ${error.message}`);
    }
  }

  /**
   * Delete document by ID
   */
  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`DeleteById operation failed: ${error.message}`);
    }
  }

  /**
   * Delete documents matching query
   */
  async deleteMany(query) {
    try {
      return await this.model.deleteMany(query);
    } catch (error) {
      throw new Error(`DeleteMany operation failed: ${error.message}`);
    }
  }

  /**
   * Count documents
   */
  async count(query = {}) {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      throw new Error(`Count operation failed: ${error.message}`);
    }
  }

  /**
   * Aggregate documents
   */
  async aggregate(pipeline = []) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Aggregate operation failed: ${error.message}`);
    }
  }

  /**
   * Exists check
   */
  async exists(query = {}) {
    try {
      const count = await this.model.countDocuments(query);
      return count > 0;
    } catch (error) {
      throw new Error(`Exists operation failed: ${error.message}`);
    }
  }
}

export default BaseRepository;
