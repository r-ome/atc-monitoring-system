import { query, DBErrorException } from "./index.js";
import { formatNumberPadding, formatToReadableDate } from "../utils/index.js";

export const getBarcodesFromContainers = async () => {
  try {
    return await query(
      `SELECT container_id, barcode FROM containers WHERE deleted_at IS NULL;`
    );
  } catch (error) {
    throw new DBErrorException("getBarcodesFromContainers", error);
  }
};

export const getContainer = async (container_id) => {
  try {
    const [container] = await query(
      `
          SELECT
            c.container_id,
            c.barcode,
            JSON_OBJECT(
              'id', s.supplier_id,
              'name', s.name,
              'code', s.supplier_code
            ) AS supplier,
            JSON_OBJECT(
              'id', c.branch_id,
              'name', b.name
            ) AS branch,
            c.container_num,
            c.bill_of_lading_number,
            c.port_of_landing,
            c.carrier,
            c.vessel,
            c.num_of_items,
            DATE_FORMAT(c.departure_date_from_japan, '%b %d, %Y') AS departure_date_from_japan,
            DATE_FORMAT(c.eta_to_ph, '%b %d, %Y') AS eta_to_ph,
            DATE_FORMAT(c.arrival_date_warehouse_ph, '%b %d, %Y') AS arrival_date_warehouse_ph,
            DATE_FORMAT(c.sorting_date, '%b %d, %Y') AS sorting_date,
            DATE_FORMAT(c.auction_date, '%b %d, %Y') AS auction_date,
            DATE_FORMAT(c.payment_date, '%b %d, %Y') AS payment_date,
            DATE_FORMAT(c.telegraphic_transferred, '%b %d, %Y') AS telegraphic_transferred,
            DATE_FORMAT(c.vanning_date, '%b %d, %Y') AS vanning_date,
            DATE_FORMAT(c.devanning_date, '%b %d, %Y') AS devanning_date,
            c.invoice_num,
            c.gross_weight,
            c.auction_or_sell,
            DATE_FORMAT(c.created_at, '%b %d, %Y') AS created_at,
            DATE_FORMAT(c.updated_at, '%b %d, %Y') AS updated_at
          FROM containers c
          LEFT JOIN suppliers s ON s.supplier_id = c.supplier_id
          LEFT JOIN branches b ON b.branch_id = c.branch_id
          WHERE c.container_id = ?;
        `,
      [container_id]
    );
    return container;
  } catch (error) {
    throw new DBErrorException("getContainer", error);
  }
};

export const getContainers = async () => {
  try {
    return await query(`
        SELECT
          c.*,
          s.name
        FROM containers c
        LEFT JOIN suppliers s on s.supplier_id = c.supplier_id
        WHERE c.deleted_at IS NULL
      `);
  } catch (error) {
    throw new DBErrorException("getContainers", error);
  }
};

export const getContainersBySupplier = async (supplier_id) => {
  try {
    return await query(
      `
        SELECT
          container_id,
          barcode,
          container_num,
          num_of_items
        FROM containers
        WHERE supplier_id = ?
        AND deleted_at IS NULL;
      `,
      [supplier_id]
    );
  } catch (error) {
    throw new DBErrorException("getContainersBySupplier", error);
  }
};

export const createContainer = async (supplier_id, container) => {
  try {
    const [{ supplier_code, supplier_name }] = await query(
      `
        SELECT
          supplier_code,
          name AS supplier_name
        FROM suppliers
        WHERE supplier_id = ?
      `,
      [supplier_id]
    );

    const result = await query(
      `
        INSERT INTO containers(
          supplier_id,
          barcode,
          container_num,
          departure_date_from_japan,
          bill_of_lading_number,
          port_of_landing,
          eta_to_ph,
          carrier,
          arrival_date_warehouse_ph,
          sorting_date,
          auction_date,
          payment_date,
          telegraphic_transferred,
          vessel,
          invoice_num,
          gross_weight,
          vanning_date,
          devanning_date,
          auction_or_sell,
          branch_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        supplier_id,
        `${supplier_code}-${formatNumberPadding(container.container_num, 2)}`,
        container.container_num,
        container.departure_date_from_japan,
        container.bill_of_lading_number,
        container.port_of_landing,
        container.eta_to_ph,
        container.carrier,
        container.arrival_date_warehouse_ph,
        container.sorting_date,
        container.auction_date,
        container.payment_date,
        container.telegraphic_transferred,
        container.vessel,
        container.invoice_num,
        container.gross_weight,
        container.vanning_date,
        container.devanning_date,
        container.auction_or_sell,
        container.branch_id,
      ]
    );

    // NOTE: GET BACK TO THIS
    // DILEMMA: IF EITHER WE SHOULD ADD CUSTOM "num_of_containers" OR RESET IT TO 0
    await query(
      `UPDATE suppliers SET num_of_containers = num_of_containers +1 WHERE supplier_id = ?`,
      [supplier_id]
    );

    const [{ name: branch_name }] = await query(
      `SELECT name FROM branches WHERE branch_id = ?`,
      [container.branch_id]
    );

    const newContainer = formatToReadableDate(container);

    if (result.insertId) {
      const { branch_id, ...rest } = newContainer;
      return {
        container_id: result.insertId,
        num_of_items: 0,
        supplier: {
          id: supplier_id,
          name: supplier_name,
          code: supplier_code,
        },
        branch: {
          id: container.branch_id,
          name: branch_name,
        },
        ...rest,
        barcode: `${supplier_code}-${formatNumberPadding(
          container.container_num
        )}`,
      };
    }
  } catch (error) {
    throw new DBErrorException("createContainer", error);
  }
};

export const updateContainer = async (id, container) => {
  try {
    const result = await query(
      `
        UPDATE containers
        SET ?
        WHERE container_id = ? AND deleted_at IS NULL;
        `,
      [container, id]
    );
    const updatedContainer = await query(
      `SELECT * FROM containers c WHERE container_id = ?`,
      [id]
    );

    if (result.affectedRows) {
      return updatedContainer[0];
    }
  } catch (error) {
    throw new DBErrorException("updateContainer", error);
  }
};

export const deleteContainer = async (id) => {
  try {
    const result = await query(
      `
          UPDATE containers
          SET deleted_at = NOW()
          WHERE container_id = ? AND deleted_at IS NULL;
        `,
      [id]
    );

    if (result.affectedRows) {
      return { container_id: id };
    }
  } catch (error) {
    throw new DBErrorException("deleteContainer", error);
  }
};
