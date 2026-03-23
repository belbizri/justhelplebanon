import { BaseRepository } from './BaseRepository.js';
import User from '../models/User.js';

/**
 * User Repository
 * Data access layer for User operations
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find users by role
   */
  async findByRole(role) {
    return this.find({ roles: role });
  }

  /**
   * Get active users
   */
  async getActiveUsers(options = {}) {
    return this.find({ isActive: true }, options);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id) {
    return this.updateById(id, { isActive: false });
  }

  /**
   * Add role to user
   */
  async addRole(id, role) {
    return this.model.findByIdAndUpdate(
      id,
      { $addToSet: { roles: role } },
      { new: true }
    );
  }

  /**
   * Remove role from user
   */
  async removeRole(id, role) {
    return this.model.findByIdAndUpdate(
      id,
      { $pull: { roles: role } },
      { new: true }
    );
  }

  /**
   * Search users by name or email
   */
  async search(searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ],
    });
  }
}

const userRepository = new UserRepository();
export default userRepository;
