const { query } = require("./");

module.exports = {
  getBranches: async () => {
    return await query("SELECT * FROM branches WHERE deleted_at IS NULL");
  },

  createBranch: async (branch) => {
    return await query(
      `
      INSERT INTO branches(name)
      VALUES (?);`,
      [branch.name]
    );
  },

  updateBranch: async (id, branch) => {
    return await query(
      `
      UPDATE branches
      SET name = ?
      WHERE branch_id = ? AND deleted_at IS NULL;
      `,
      [branch.name, id]
    );
  },

  deleteBranch: async (id) => {
    return await query(
      `
        UPDATE branches
        SET deleted_at = NOW()
        WHERE branch_id = ? AND deleted_at IS NULL;
      `,
      [id]
    );
  },
};
